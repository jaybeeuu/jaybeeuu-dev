We all know the benefits of breaking the code for an application down into small easily understood coherent components,
which can be edited with confidence.
In the old days JS had no built in way of doing this  (it was after all only intended to make the monkey dance)
but as web pages turned into web applications it become obvious that this needed to change.

One way that it could be achieved pretty early on was "importing" modules using a series of `<script>` tags from your html.
This was pretty crude.
JavaScript files grew pretty large since breaking them down was hard work.
So it was done at the "library" level.
Dependencies often weren't clear & there was no automatic way to go and update all of the places they were used,
and the order of imports was sacrosanct.
Utility files in projects would grow and grow and often be imported on every page.
Dead code was hard to identify and eliminate.

Because there was no definition of a module there was also no definition of how a file should export public code.
The global scope was the only real choice and soon became a busy place.
That resulted in name collisions and, JavaScript being what it is,
that was perfectly OK from the point of view of the interpreter.
Even Libraries like `jQuery` and `Underscore` whose exports and aliases were well known ran into others using their names.
Techniques were used like namespacing to try and avoid collisions,
but inevitably someone would overwrite someone else's behaviour,
bugs ate up whole applications.

Something had to give.
The great thing about JavaScript has always been it's rich ecosystem and community,
and it really pulled together over this problem to create a few competing standards in userland.
Each had it's own quirks and benefits and in this article we'll have a look at a few.

Before we get into it though I should point out that this is mostly interesting from an historical point of view,
you don't need to know all of them.
The main systems you will come in contact with are now `CommonJS` and `ES6 Modules`.

## What is a module anyway?

A module is a file containing JavaScript code.
They allow us to build up complex applications from smaller simpler components.

A module might export a class or a group of constants or functions,
but whatever it exports should be closely related.
This is similar to classes in OO languages (like Java or C#).

OK, but we had files, so what was the problem?
The bit we were missing was a "module system".

## Right... module systems

Reductively, a module system is the definition of how code gets into and out of a module,
It will also define the context of declarations which are made within the module.

Let's tackle that last bit.
By context I mean "what things can I access from here".
For example if you have 2 modules (in an imaginary module system):

```js
// a.js
const thing = "a thing";

// b.js
const thing = "another thing";
```

In both modules there is a constant called `thing`.
So how do they interact?
Will the two declarations overwrite each other?
or be completely independent?
Does it matter if `a.js` imports (uses) `b.js`?

A module system will define all of that so that developers know what they are getting into.
It must also define how code gets shared between the modules.
How do you define what a module exposes to consumers?
How does a module define it's explicit dependencies
and get handles on the functionality it requires from them (imports and exports)?

Finally what order does the code in the modules get executed.
Does each module get executed as it is imported or is there a static analysis step?
What happens when more than one module depend on the same module?
Do they get their own instance or do they get the same copy?

Hopefully you can see that they are pretty important, and that there's a lot to consider.
And JavaScript didn't have a standard.
Each module system was built for a specific purpose, with different constraints,
and had it's own answer to each of those questions.

Lets have a look at a few.

## Styles of Module you might see in the wild

### [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition)

*A*synchronous *M*odule *D*efinitions.
Most notably implemented by [Require.js](https://requirejs.org/).
This is one of the early standards.
It was designed to run in the browser with a custom runtime downloading smaller modules, in parallel, as they were required.
The aim here was to improve load times by parallelising the downloads
and delaying download of the whole app until it was really needed.
There is also an "optimizer" which allowed the modules to be bundled and minified for production.

Here's what an AMD module looks like:

```js
// Cat.js
define(["movement/prowl", "noises/miaow"],
  function (prowl, miaow) {
    class Cat {
      speak() {
        miaow();
      }

      move() {
        prowl();
      }

      isBetterThanADog() {
        return true;
      }
    }

    return Cat;
  }
);
```

The key here is the `define` function on line 1.
The AMD runtime (e.g. Require.js) uses wraps the module code and supplies a couple of variables to use to define your
module. Define is one of those.
`define` tells the `AMD` runtime you are going to... define a module.
The first argument is an array of the dependencies.
These are either relative paths to the modules (e.g. `movement/prowl` and `noises/miaow`)
or an alias like `jQuery` whose resolution is defined in config.
The second argument is the function to run that does the actual module definition.
It's arguments are the dependencies (e.g. `prowl` and `miaow`) and that is how require gets them into your code.

The result of the function (e.g. `return Cat;`) defines the export of the module (in this case the `Cat` class).

In order to fulfil the dependencies and be able to make our `Cat` class,
when Require.js executes the `define` function it first downloads the dependencies in the array (in parallel).
The JavaScript it gets back is then executed to get it's exports, and so on until the whole graph has been discovered.
The results into the module definition function. Any one module is only initialised once.
so if two modules request the same dependency it will only be retrieved & executed once
and they will get the same instance of the exports.

Because all the module code is executed within a function it is well isolated from the rest of the JavaScript environment.

IMHO the syntax is pretty complex, setting up the runtime and aliases is finicky.
These days it's not a popular option, but it worked OK in it's hay day.
There are still times when you might see something like this is if you are debugging code which has been bundled
by bundlers like Webpack, Parcel etc without source maps.
They can often be configured to have an `AMD` style output so that code may look something like this.

### [CommonJS](https://en.wikipedia.org/wiki/CommonJS)

This is the module system implemented by [Node.js](https://nodejs.org/en/).
Because of this it is much more likely you will come across it.
It is definitely worth getting into some detail about this one.
Although it's worth noting that from v14 Node.js
(in latest LTS version at the time of writing)
supports ES modules (more on that later).
So expect to see the ecosystem move in that direction.

The way this works is that when node executes the JS in a module it wraps the code in a function.
The function makes sure that the module is executing in it's own context, and internals don't bleed into the global scope.
It also supplies a couple of special variables which the module can use.
More details can be found [here](https://nodejs.org/docs/latest/api/modules.html#modules_the_module_wrapper),
but the important ones for the sake of this discussion are `exports`, `module` and `require`.

Here's an example ripped almost exactly from the [node docs](https://nodejs.org/docs/latest/api/modules.html)...

```js
// circle.js
const { PI } = Math;

exports.area = (r) => PI * r ** 2;

exports.circumference = (r) => 2 * PI * r;
```

Here two functions, `area` and `circumference`, are exported as named exports on the `exports` object.
This makes them accessible to the outside world.
The `exports` object though is just a shortcut to the `module.exports` object so you can do the same thing like this:

```js
module.exports.circumference = (r) => 2 * PI * r;
```

Lets have a look at the other end of this and see how the modules are consumed:

```js
// index.js
const circle = require('./circle.js');
console.log(`The area of a circle of radius 4 is ${circle.area(4)}`);
```

On the first line you can see the `require` function being used to import the `circle` module.
After it has been executed the `circle` variable will contain a reference to the object that was on
`module.exports` once the circle code had been executed.
In this case `area` and `circumference`.
Note that the argument to `require` is a relative path from the current module (`index`)
to the required module (`circle`) in this example they must be next to each other in the same
directory to work
(`.` in a relative path refers to the current directory, `..` navigates up the tree etc.).

Another common way to define an export is to write directly to the `module.exports` property.
Thus defining the "default export".

```js
// square.js
module.exports = class Square {
  constructor(width) {
    this.width = width;
  }

  area() {
    return this.width ** 2;
  }
};
```

The square class is written straight onto `module.exports` and so becomes the only export which this module defines.
So when the module is required the class can be accessed directly:

```js
// index.js
const Square = require('./square.js');
const square = new Square(2);
console.log(`The area of a square with width 2 is ${square.area()}`);
```

A thing to note here is that the `exports` argument is a short cut to the `module.exports` property,
but it is the `module.exports` object which actually gets passed to the dependents.
Therefore if you overwrite it, anything which is written to `exports` will be ignored and only things written to
`module.exports` after it has been overwritten will be available...

```js
// missing-module.js

exports.a = function () {
  console.log('Can\'t touch this');
};
module.exports.b = function () {
  console.log('Nah na na na, nah na, nah na');
};

module.exports = {
  c: function() {
    console.log('This had better do all those other things...');
  }
};

module.exports.d = function() {
  console.log('hmmm... something\'s missing.');
}
exports.e = 'An important message.';
```

In this case any module importing `missing-module` will only be able to use `c` and `d`.
`a`, `b` and (surprisingly?) `e`
(remember `export` is the _starting_ value of `module.exports` but `module.exports` is what is actually used)
were defined on an object which will have been tied up by the garbage collector...
For this reason you should be cautious about mixing `module.exports` and `exports`
and in general only use one or the other.
You might also see this: `module.exports = exports = ...` which allows `exports` to be used _after_
`module.exports` has been set.
Still anything written to it before will be lost.

Another thing to bear in mind is that the `require` statements can go anywhere so the dependencies
of a file are not necessarily obvious.
Since dependencies are pulled in by `require` at runtime, Dependencies can even be optional, .
So `const module = someBoolean ? require('./a') : require(someStringPath);` is perfectly valid.
This means there is no way for the dependencies to be statically analysed (more on that later).

On the whole `CommonJS` is a reasonably good module system and there aren't many gotchas.
Whereas `AMD` forces you to call the `define` function,
`CommonJS` hides that from us so it's syntax is terse.
The `require` statements which pull in dependencies can go anywhere in the file which can lend readability
(although it also prevents some more advanced features).
We haven't talked about cyclic dependencies (module A depends on B depends on A) but `CommonJS`
[handles](https://nodejs.org/docs/latest/api/modules.html#cycles) them reasonably robustly.

### [UMD](https://github.com/umdjs/umd)

`AMD` and `CommonJS` are similar in their execution pattern, but have incompatible API's.
CommonJS works great for `node.js`, while the async nature of AMD was well suited to he browser.
Library authors though often wanted to make their code run in both browser and node.
And so *U*nified *M*odule *D*efinitions was born.
The goal here is to write 1 module which can be imported by, for example, `AMD` and `CommonJS` modules.

At it's core is a series of templates in a GitHub
[repo](https://github.com/umdjs/umd). They work fine - but getting your head around what they do can be tricky.

Here's an example ([commonjsStrictGlobal.js](https://github.com/umdjs/umd/blob/master/templates/commonjsStrictGlobal.js)):

```js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'b'], function (exports, b) {
            factory((root.commonJsStrictGlobal = exports), b);
        });
    } else if (
      typeof exports === 'object'
      && typeof exports.nodeName !== 'string'
    ) {
        // CommonJS
        factory(exports, require('b'));
    } else {
        // Browser globals
        factory((root.commonJsStrictGlobal = {}), root.b);
    }
}(
  typeof self !== 'undefined'
    ? self
    : this,
  function (exports, b) {
    // Use b in some fashion.

    // attach properties to the exports object to define
    // the exported module properties.
    exports.action = function () {};
  }
));
```

So the wrapper is a function (this is JavaScript after all). You can see it defined on lines 1-16.
It takes two arguments.
`root` will be the global `this` and `factory` will contain the actual definition of the code.

n that first top level indentation (line 2-15) you can see the wrapper looking to see where it's landed.
First it tests to see if it's in an `AMD` environment with `typeof define === 'function'`, then for `CommonJS`
(`if (typeof exports === 'object')`) and finally the module falls back to assuming it's dependencies are defined in the
global scope.

Once it knows what the module system it's in, it injects the `exports` object and the dependencies into the module
`factory` function (lines 16-22, the second top level indentation).

Again this isn't a module definition type that you are likely to come across regularly,
unless you look at the source code of some older libraries, are find your self rooting around in `node_modules`.
So don't worry too much.
If `AMD` is a penny-farthing then I suppose `UMD` is a horse with a penny-farthing bolted on one side
and a reasonably price car (`CommonJS`) tied to the other.
Let's move on.

### [ES6](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

This is the one to pay most attention to. This is the officially sanctioned module standard as per the ES6 specification.
It has taken a while but most browsers now
[support](https://caniuse.com/#search=modules)
it natively.
Because of
[differences](https://hackernoon.com/node-js-tc-39-and-modules-a1118aecf95e)
between node's `CommonJS` and `ES6`
modules it has taken longer for modules to be supported there, but it landed in LTS in
[v14](https://nodejs.org/docs/latest-v14.x/api/esm.html#esm_modules_ecmascript_modules).

Lets get down to brass tacks...

```js
// circle.js
const { PI } = Math;

export const area = (r) => PI * r ** 2;

export const circumference = (r) => 2 * PI * r;

export const diameter = (r) => 2 * r;
```

In this adaptation of the circle example I showed in [CommonJS](#commonjs) you can see 3 things being exported.
The `area`, `circumference` and `diameter` functions are *named exports* from this module to access them
you must use curly braces in your `import` statement.
Like this:

```js
import { circumference, diameter } from './circle.js'

console.log(
  `The circumference of a circle of radius 4 is ${circumference(4)}`
);

console.log(
  `The circumference of a circle of radius 2 is ${diameter(2)}`
);
```

I `import` more than one named export by using a comma.
This should look familiar from object destructuring.

I don't have to `import` everything if I don't want to.
In the case of this module we only need `circumference` and `diameter` so those are the only exports I reference.
If you just want everything you can do that too with a `* as`:

```js
import * as circle from './circle.js'

console.log(
  `The circumference of a circle of radius 4 is ${circle.circumference(4)}`
);
console.log(
  `The circumference of a circle of radius 2 is ${circle.diameter(2)}`
);
```

If I want to use a different name (perhaps to avoid a collision with another module) for the `export`
I can do that too - but the syntax diverges from the object destructuring syntax:

```js
import { area as circleArea } from './circle.js';
import { area as triangleArea } from './triangle.js';

console.log(
  `The area of a circle of radius 4 is ${circleArea(4)}`
);
console.log(
  `The area of a 4 x 2 triangle is ${triangleArea(4, 2)}`
);
```

OK that's named exports and imports. Defaults...

We can define a *default export* for the module.
The `square` module below does that:

```js
// square.js
class Square {
  constructor(width) {
    this.width = width;
  }

  area() {
    return this.width ** 2;
  }
};

export default Square;
```

Here the `default` keyword has been used as well as `export`.
Importing the default is simple too - just omit the curly braces and you get the default:.

```js
import Square from './circle.js'

const square = new Square(2);
console.log(`The area of a square with width 2 is ${square.area()}`);
```

When you import a default export you can call the variable whatever you like there's no need use `as`.

The final case is one where you have both named and default exports. Like in the slightly contrived triangle
module below...

```js
// triangle.js
export const area = (base, height) => 1/2 b * h

class Triangle {
  constructor(base, height) {
    this.base = base
    this.height = height
  }
  area() {
    return area(this.base, this.height);
  }
}

export default Triangle
```

```js
import Triangle, { area } from './triangle.js';

const triangle = new Triangle(4, 2);
console.log(
  `The area of a 4 x 2 triangle is ${area(4, 2)}`
);
console.log(
  `The area of a 4 x 2 triangle is ${triangle.area()}`
);
```

Again you don't have to import everything so if you only want either default or named exports then that is fine.
Also if you want to use `as` or `* as` as well as the default,
named imports behave themselves as you would expect.

Once you get started with ES6 imports they are pretty clear. The syntax is reasonably simple and they are flexible
enough to allow you to do what ever you need with them.
If you dig into the
[details](http://exploringjs.com/es6/ch_modules.html#sec_cyclic-dependencies)
a little then they turn our to handle cyclic dependencies better than `CommonJS` too.
There is also support for async loading of modules out of the box, in a similar manner to `AMD`.
We're getting the best of both here!

One thing to bear in mind is that during the lifecycle of `ESM` they are subjected to a static analysis step.
So, in contrast to `CommonJS`, you can only define imports
(with the exception of [dynamic imports](https://github.com/tc39/proposal-dynamic-import))
and exports at the top level.
That means that other tools can also statically analyse the modules
and opens up some really interesting features like
[tree shaking](https://webpack.js.org/guides/tree-shaking/)
.

## Conclusion

Hopefully you found that interesting.
I'll admit the `AMD` and `UMD` stops on the tour are mostly interesting from an historical standpoint.
For day to day coding `CommonJS` and increasingly `ES Modules` are really all you need,
but there are times when you see these in the wild and it's good to know what you're looking at.
I also find it fascinating to see the aspects of those historical module systems exhibiting themselves in the solution
adopted into the language now, and some of their failings addressed.
