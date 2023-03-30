# Jest and pnpm

[pnpm](https://pnpm.io)
is my package manager of choice.
I like pnpm because it's quick, feature rich and doesn't turn my `node_modules` directory into a black hole.
But mostly because it's approach to dependency management completely prevents
[phantom dependencies](https://rushjs.io/pages/advanced/phantom_deps/)
.

Recently it's file structure caused some problems with my favourite testing library
([jest](https://jestjs.io/))
.
FIguring out the cause and the solution lead me to dig a bit deeper in to both tools.
I think the main take away for me here is read the docs,
but I also learned some interesting stuff about the tools.

## The problem

Among other things, pnpm creates a directory structure for `node_modules` which is
[nested as opposed to the flat structure used by npm and yarn classic.](https://pnpm.io/motivation#creating-a-non-flat-node_modules-directory).

This is a good thing.
Because of the way node resolves imported packages,
a flat `node_modules`, allows your code to import those transient dependencies of your dependencies,
as if they were your own.
These are known as
["phantom dependencies"](https://rushjs.io/pages/advanced/phantom_deps/)
and they are a curse.

The pnpm solution is to
[build `node_modules`](https://pnpm.io/blog/2020/05/27/flat-node-modules-is-not-the-only-way)
so that the only dependencies you have access to are the packages you declare in your `package.json`.
It turns out to be the recommended way to structure `node_modules` according to
[the node docs](https://nodejs.org/api/modules.html#modules_package_manager_tips)
and
[npm](https://github.com/npm/rfcs/blob/main/accepted/0042-isolated-mode.md)
and
[yarn](https://dev.to/arcanis/yarn-31-corepack-esm-pnpm-optional-packages--3hak#new-install-mode-raw-pnpm-endraw-)
are catching on.
Recently though pnpm's file structure caused me some headaches while updating my dependencies.

I regularly run `pnpm update --latest` and rely on my E2E and unit tests to catch problems caused by the upgrades.
Nearly all packages are fine,
occasionally there's a problem with a missing or incorrect dependency declaration,
easily solved with a
[`.pnpmfile`](https://pnpm.io/pnpmfile)
entry or a request/PR in git hub.
The big issue though was when some of my unit tests to started to fail
with unexpected token errors, related to imports of libraries like
[preact](https://preactjs.com/)
and
[chalk](https://www.npmjs.com/package/chalk).

It seems unlikely that the communities of those
libraries would ship or leave shipped code which was so broken it didn't parse.
So what gives?

## The cause

It turns out that the breaking change was an update to the package
[module format](/blog/module-spotting)
, presenting an ESM rather than the previous CommonJS module.
That should be fine though shouldn't it?
I'm running node v18 which supports native ESM.

No such luck. At the time of writing
[Jest only has experimental support for ESM](https://jestjs.io/docs/ecmascript-modules).
There's a lot of magic hat Jest does when it runs your tests,
but one of the things is to orchestrate transpiling the ESM you write to CommonJS modules,
which is what it passes on to node to execute.
My understanding is that, while Node does support ESM,
there are some
[API's which aren't yet stable for ESM](https://nodejs.org/api/vm.html#vm_class_vm_module),
but Jest needs for features like mocking.

But Jest transpiles or at least can transpile ESM to CommonJS right?
So what's the problem?
Well... `node_modules`.
By default Jest makes no effort to transpile code in `node_modules`,
it would be expensive,
and shouldn't be needed;
package authors are expected to publish code compatible with the node versions declared via `engines`.
That assumption saves countless CPU cycles and hours of your time.
Be grateful.
But in this case causes the tests to fail without prejudice.

## The Solution

Fortunately Jest gives us a way to tell it to transpile select packages.
So for the package which are now ESM we can craft
[`transformIgnorePatterns`](https://jestjs.io/docs/configuration/#transformignorepatterns-arraystring)
which include them and the magic should be back on.

Adapting Jest's example:

```ts
transformIgnorePatterns: ["/node_modules/(?!(chalk)/)"]
```

That config will not transform modules which match the regexp.
For example `node_modules/foo` does match (`(?!` is a negative look ahead), and so would be ignored by the transformer.
`node_modules/chalk` does not match and so would be transformed.
(yes, there's a confusing double negative in this...).

But that didn't work.
Frustrating.
Stack overflow didn't help, nothing in GitHub issues, blog posts and gists.... no dice.
This should _just_ work.
But it didn't.

A lot of cursing and poking around later, and I have found out the cause.
To do so I ended up searching though Jest in my `node_modules` for uses of `transformIgnorePatterns`.
That led me to instrument `ScriptTransformer.js`.

It's pnpm's fault.

Lets think through a bit of what is happening here.
WHen you import something, for example:

```ts
import chalk from "chalk";
```

The runtime takes the string,
`"chalk"`,
and applies a module resolution algorithm to it to discover the JavaScript file it relates to.
In this case the algorithm is node's, so in npmland `"chalk"` get's resolved to something like this:

```txt
path/to/your/project/node_modules/chalk/source/index.js
```

and that's what is used to compare with the regexp.
This doesn't match so jest... doesn't... ignore it... and...
passes it to babel to transform into CommonJS (not confusing at all).

Except I'm using pnpm so that's not what `"chalk"` resolves to.
Instead I get this:

```txt
path/to/your/project/node_modules/.pnpm/chalk@5.2.0/node_modules/chalk/source/index.js
```

This is because of another awesome feature on pnpm.
One of it's optimizations is that you only get one copy of any one version of a package on disk.
That copy is symlinked to the right place so that node can find it.
This is good.
A common problem developers using npm face is that `node_modules` can get big.
If there's a lot of dependencies, really big.
[Pnpm's strategy of linking packages allows nodes recommended structure and saves disk space](https://pnpm.io/motivation#saving-disk-space).

But that breaks our regexp.
Even though that file path still has `node_modules/chalk` in it, the string matches the regexp
(and so does not get transformed)
since it also contains `node_modules/.pnpm`.

Let's change the regexp:

```ts
transformIgnorePatterns: ["/node_modules/(?!(\\.pnpm|chalk))"]
```

So now we don't match `node_modules/.pnpm`, we _might_ match the second `node_modules`, but not `node_modules/chalk`.

Finally!

That was hard work.
And to make it worse,
[should have read the docs](https://jestjs.io/docs/configuration#transformignorepatterns-arraystring).
At least I learnt a thing or two.
