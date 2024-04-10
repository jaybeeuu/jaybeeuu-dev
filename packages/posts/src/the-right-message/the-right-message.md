# Getting the Message Right

I don't think you can overestimate how important an error message can be.
Especially in our tooling, it can make the difference between seconds and hours.

Recently I was working on a CLI tool which scraped some data out of Microsoft Graph API.
I was working in in TypeScript, and while there _is_ a type package for the Graph API, all the props on the responses are `null` and optional.
I like to dial my strictness to 11, which meant errors everywhere.

WHy have strict types?
Strict types protects you from errors. If you can guarantee that you aren't going to pass `null` instead of an array, you know that you're not going to accidentally throw an error when you call `map` on he variable. IF you don't have `strictNullChecks` on then type script won't complain even if you explicitly passed `null`.

Each of the other strict checks is designed to protect you from other errors, like problems with the way you call functions, or that your function is compatible with the type you are assigning it to. Strict types give you more value from running TypeScript. So they are, in my view worth while.

Of course they come at a cost - strict types cause you the user to have to take more care over your code, and can lead to some sticky situations where types need to be more complex than they would be otherwise. IMO they are worth this cost, but opinions differ.

There's another moment where strict types can make things more complex, and that is when data is brought into your app. Almost always this means doing something like parsing some data format, be it JSON, YML, or something more complex like a raw binary.

Let's take the simple case; `JSON.parse`.

This parsing could fail - if you have a mangled JSON for example.

If you don't know that thaen you can end up with

All this gave me the chance to play with a validation/type assertion library I wrote a while ago.
I've recently promoted it to it'a own package and published it, so you can find it here:
<https://www.npmjs.com/package/@jaybeeuu/is>.

`is` lets you leave all of that unsafe typing at the door by building up guards and assertions that guarantee the object has type shape you need. For example, if you wanted a shape like this:

```ts
interface CrewMember {
  name: string;
  age: number;
}

interface Ship {
  affiliation: "Royal Navy" | "Pirate";
  name: string;
  crew: CrewMember;
}
```

You could build a type guard with `is` like this:

```ts
import { is, isLiteral, isObject, isArrayOf, isUnionOf } from "@jaybeeuu/is";

const isCrewMember = isObject({
  name: is("string"),
  age: is("number"),
});

const isShip = isObject({
  affiliation: isUnionOf(isLiteral("Royal Navy"), isLiteral("Pirate")),
  name: is("string"),
  crew: isArrayOf(isCrewMember),
});
```

That let's you validate anything coming into your application, as soon as it arrives. That way your business logic isn't littered with `null` checks and needless branching.

More battle hardened and better supported libraries solving this exist, for example [`runtypes`](https://www.npmjs.com/package/runtypes).
But building this thing was a good exercise in some obscure type manipulation (for example, how exactly do you turn a tuple into an intersection type? (and why would you ever want to anyway?)).

When I first built it failing a validation was pretty dumb - it would throw an error that said something like this:

```plaintext
Expected { some: { long: 2, string: "of" }, type: ["information"]} but received "object"
```

Dead simple. all the validation functions returned tru or false, and the top level assert just checked the Answer. it knew the description of the type, and held a reference to the candidate, so it really didn't need to do much. Just format a string & throw an error.

When I hit that error all of a sudden, I hadn't as far as I remembered changed anything about the way I was calling the API.
So the error was unexpected.
And frustratingly didn't tell me anything about what was actually wrong with the value I was checking.
Look again, all it says is that it wanted something hard to read adn didn't get it, nothing about actually what was wrong.
Euch!
Debugging needed. Console logs, breakpoints what have you.
PITA.

And, worse, because of the way the types are built up in `is` _something_ knew exactly which property was wrong.
It just wasn't telling me!

Here's where the error message has let me down.
"Something has gone wrong" is next to useless, especially if it's not next to where it went wrong.
(Another reason to validate your data on the way into the application.)

## Can we do better?

Yes, we can.

With a bit of work, instead of returning just `true` or `false`, I was able to return `true`, or `false and this is why`,
and then use that reason info to build up the message.

It went to something like this:

```plaintext
Expected { some: { long: number, string: string[] }, of: string | number; type: { information: boolean }[]} but received object.

root.type[3].information: Expected "boolean", but received "undefined"
```

Woah. now I was cooking with gas.
The name of the property and the location within the object that it had failed, and what the value actually was.

Moments after I saw it I knew that answer was that I'd reduced the permissions in my OAuth app registration. The API call hadn't returned the missing property, since it was privileged information and required elevated permissions.

Problem solved; and all it needed was a better message.
