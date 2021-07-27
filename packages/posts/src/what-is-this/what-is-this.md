`this` is one of the most derided and maligned concepts of JavaScript, and rightfully so.
It is complex and confusing.
When I was learning JavaScript I was coming from the well ordered world of C#.
`this` seemed like a poltergeist in the code. No matter what I thought the key word `this` referred to,
it always seemed to be something different.
Sometimes even that same `this` in the same function seemed to change half way through my application.
Infuriating!

There have been improvements in the intervening years
so you can weave through the bear traps
but even now working in professional teams I see regular confusion
and occasional bugs caused by a mishandled `this`.

I thought it would be worthwhile refreshing my memory by
exploring some of the rules that govern `this`,
and some strategies to avoid the pitfalls.

## The rules of `this`

The good news is that JavaScript doesn't make up what `this` refers to each time you use it.
There are a set of rules. and in order to decode `this` we just need to learn the rules.
So what are they?

I had look through the ECMA spec to find a definitive list.
But it gets a little involved and only gives part of the story given the W3C API we use in the browser.
Perhaps its the subject of another post another time.
Instead I'm going to present a slightly augmented version of a list you find on [w3schools](https://www.w3schools.com/js/js_this.asp).

> * Alone, `this` refers to the global object.
> * In a method, `this` refers to the owner object.
> * In a function, `this` refers to the global object.
> * In a function, in strict mode, `this` is `undefined`.
> * Methods like
[`call`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call)
 and
[`apply`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)
can refer `this` to any object.
> * In a "bound" function `this` is the value of the first the argument of [`bind`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
> * In a callback or event handler; consult the docs.
> * In an arrow function `this` gets it's value from the enclosing scope.

If that looks like a lot of rules, I agree.
I also suspect this isn't all of them - one person I spoke to had heard there are 26 different values `this` can take.
It seems like exaggeration, but I can believe it.

If you, like me, never want to memorise a list of rules as long as this then skip to [Surviving `this`](#surviving-this).
I'll talk about some strategies I use to make sure `this` isn't a problem I have to think about
(there are fewer than there are rules).
Otherwise let's have a look through the rules and see what they mean.

## Alone, `this` refers to the global object

This is the simplest rule.
In the top level of your code, before you get into any functions or classes,
it is either `window` in the browser or `globalThis` in Node.js.

We can demonstrate that like this:

```js
console.log(this === window); // prints true
```

or in Node.js:

```js
console.log(this === globalThis); // prints true
```

Nothing tricksie about that. Let's move on.

## In a function, `this` refers to the global object

This rule refers to making functions with the `function` keyword. For example:

```js
function sayHello() {
  console.log("Hello.");
}
```

Fine so now we know what the rule applies to, what does it mean?
In a functions `this` refers to the global object.
The global object is `window` or `globalThis` just like the value of `this` when it's on it's own in the [first rule](#alone-this-refers-to-the-global-object).

Lets see some examples.
(From now on I'm going to ignore Node.js in my examples.
But if you want to run them there then substitute `window` for `globalThis`; the rules are the same.)

```js
function spaghetti() {
  console.log("Meatballs.", window === this);
}

spaghetti(); // prints meatballs. true

const plate = { spaghetti };
plate.spaghetti(); // prints meatballs. false

function doSomething(callback) {
  callback();
}

doSomething(plate.spaghetti); // prints meatballs. true
```

Head spinning?
Want to skip the other rules and learn how to survive in this crazy mixed up world?
[Me too](#surviving-this).

Otherwise read on...

## In a function, in strict mode, `this` is `undefined`

Right so this is pretty much the same as the last rule.
But this time we add in [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode).
If you aren't running your code in strict mode you should be.
Honestly, though, these days you probably are.
It's on by default in the output of most bundlers and it's the only choice in ES6 modules.

When you run in strict mode then in functions `this` is `undefined`.

Lets use very similar examples to the ones above:

```js
"use strict";

function spaghetti() {
  console.log("Meatballs.", undefined === this);
}

spaghetti(); // prints meatballs. true

const plate = { spaghetti };
plate.spaghetti(); // prints meatballs. false

function doSomething(callback) {
  callback();
}

doSomething(plate.spaghetti); // prints meatballs. true
```

The only differences here are I've swapped `window` for `undefined`,
and added `"use strict";` to the top to force the browser into strict mode.

So we've added a dimension, but hopefully it's clear what's happened?

OK let's move on.

## In a method, `this` refers to the owner object

This rule introduces a slightly mysterious term. "Method".
The distinction between a method and a function, I think, is slightly subtle.
So I'm going to take a moment to explain.

A method is a "property" whose value is a function.
A property is a variable stored on an object or class instance.
For example:

```js
const thing = {
  other: 3
};
```

Here `other` is a property on `thing`.
If instead of giving it a value `3` I gave it the value of a `function`.
Then it would be a method. For example:

```js
const thing = {
  other: function() {
    return 3;
  }
};
```

Now `other` is a method.

I could also have used the shorthand to define `other`. Like this:

```js
const thing = {
  other() {
    return 3;
  }
};
```

But the result is the same. `other` is a method.

The easiest way to think about this is if you need to use a `.` to access it, then it's a method.
For example:

```js
const thing = {
  other() {
    return 3;
  }
};

thing.other();
```

To use `other` you have to use `.` to get hold of it so it's a method.

Now we've got an idea of what a method is let's get back to the rule.
Inside a method `this` is the "owner".
The "owner is simply whatever is on the left hand side of that `.` you used to access the method.
It's most obvious what that means in a class. For example:

```js
class Fruit {
  constructor(type) {
    this.type = type;
  }

  makeSmoothie() {
    console.log(`${this.type} Smoothie`);
  }
}
const banana = new Fruit("Banana");

banana.makeSmoothie();
```

Here `makeSmoothie` is the method.
In order to use it we need to use a `.` and it's owner is the instance of `Fruit` (`banana`).
That's what is on the left of the `.` when we make our smoothie.
So we get `"Banana Smoothie"` in the console. Yum.

If you've worked with an OO language like C# or Java that is probably familiar.
Less obvious is that this rule doesn't only _apply_ to classes.
It can mean anonymous objects:

```js
const apple = {
  type: "Apple",
  makeSmoothie() {
    return `${this.type} Smoothie`;
  }
};
console.log(
  apple.makeSmoothie()
); // Prints "Apple Smoothie"
```

More troublesome - the "Owner" is whoever **currently** has the reference to the function.

```js
const apple = {
  type: "Apple",
  makeSmoothie() {
    return `${this.type} Smoothie`;
  }
};

const carrot = { type: "Carrot" };
carrot.makeSmoothie = apple.makeSmoothie;

console.log(
  carrot.makeSmoothie()
); // Prints "Carrot Smoothie"
```

That's not so bad, maybe a little weird though.
Just by using a reference to the function we can change the value of `this`.

Even worse by assigning a method to a variable or passing it as an `argument` to a function the method *becomes*
a function  once more.
i.e. the methodness or functionness is a property of *where the thing is stored*, not what is is or where it was written.
This has consequences...

```js
const strawberry = {
  type: "Strawberry",
  makeSmoothie() {
    return `${this.type} Smoothie`;
  }
};

const vendingMachine = {
  takings: 0,
  placeOrder(money, makeOrder) {
    takings = this.takings + money;
    return makeOrder();
  }
};

console.log(
  vendingMachine.placeOrder(10, strawberry.makeSmoothie)
); // Prints "undefined Smoothie"
```

No thanks.
We clearly didn't get `strawberry` on `this` so what was it?
Turns out to be `window`.
We get an `unndefined` smoothie because `window` has no `type` property.
We can confirm that by altering `makeSmoothie` like this:

```js
makeSmoothie() {
  console.log(window === this); // prints true
  return `${this.type} Smoothie`;
}
```

Why `window`?
The reference in the `placeOrder` function is not a method. Remember the second rule of fight club, I mean, functions?
[In a function `this` refers to the global object.](#in-a-function-this-refers-to-the-global-object)
In this example I haven't used strict (I was lazy and unprofessional).
If I had then the value of `this` would have been [`undefined`](#in-a-function-in-strict-mode-this-is-undefined).

Can you think of any times you've had to pass a function as a callback?
Just a few.
Ever get an error from a function using `this` that you've passed as a callback?
This little injustice is why.
Until we had `async/await` JavaScript's
entire async model was based on passing callbacks.
Even now, array functions and event handlers, passing functions is bread and butter to a JS dev.
JavaScript is a functional language,
and certainly treating it as such is one of the best way to write JavaScript.
Sorry Mr Eich, JavaScript is fantastic in many ways.
But IMHO, in a language with functions as first class citizens a mutant `this` is not good design.

Are you sure you don't just want to skip to the [end](#surviving-this)? These rules are complicated and they only get worse.

## Methods like `call`, and `apply` can refer `this` to any object

This seems enigmatic, but actually this rule is one of the most deterministic.
[`call`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call)
and
[`apply`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)
are methods, on any function,
that you can use to invoke the function.
They allow you to pass in arguments and, crucially, allow yo to define what the function will treat as `this` during execution.

This is really much easier with some examples...

```js
function tellUsWhatYouLike(favoriteThings) {
  console.log(`${this.name} likes ${favoriteThings}`);
}

tellusWhatYouLike.call(
  { name: "Samiam" },
  "Green eggs and ham"
);
// logs "Samiam likes Green eggs and ham"
```

So without using `call`, `this.name` in `tellUsWhatYouLike` would have been `window.name`
(we're not in strict mode - I'm too lazy to type it).
Which is `undefined`.
With `call`, however, the first argument we pass `call` is given to the function to use as `this` for this call.
Effectively allowing us to pass it in as another argument.

Apply is basically the same...

```js
tellusWhatYouLike.apply(
  { name: "Maria" },
  ["Raindrops on roses and whiskers on kittens"]
); // logs "Maria likes Raindrops on roses and whiskers on kittens​"
```

The difference is that `apply` takes an array of arguments after the `this` argument.
(Before we had `...` this was the only way to dynamically pass up a list of arguments to a function.)

Both of these functions are one time things though.
If we called `tellusWhatYouLike` normally after these invocations then we would just be back to `undefined`...

So what if we do want it to be a permanent thing? The next rule has you covered.

## In a bound function `this` is first the argument of `bind`

Just like `call` and `apply`
[`bind`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
lets us supply a value for `this`.
But this time for keeps.
BInd is also slightly different in that rather than invoking the function, it copies it.
So it is useful for passing callbacks and handlers for example. In fact let's use it to fix the example from earlier.

```js
const strawberry = {
  type: "Strawberry",
  makeSmoothie() {
    return `${this.type} Smoothie`;
  }
};

const vendingMachine = {
  takings: 0,
  placeOrder(money, makeOrder) {
    takings = this.takings + money;
    return makeOrder();
  }
};

console.log(
  vendingMachine.placeOrder(
    10,
    strawberry.makeSmoothie.bind(strawberry)
  )
); // Prints "Strawberry Smoothie"
```

The only thing I've changed here is to call `bind` on `makeSmoothie` on it's way into `placeOrder`.
Passing `strawberry` into the first argument.
Effectively, copying the function and baking in a value for `this`.
Now when `placeOrder` calls it's `makeOrder` callback, `mmakeSmothie`, has a value for `this` and we all get what we want.

This is one of the strategies we can use for dealing with `this`.
It's not [my favourite](#surviving-this), but it's a tool in the box.

What's next...

## In a callback or event handler; consult the docs

If you are passing a function or method to anything then you are best to consult the documentation.
Sometimes the target will make a change to `this` or allow you to define `this` in some way.

An example is in
[DOM event handlers](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Event_handlers#event_handlers_parameters_this_binding_and_the_return_value)
When you define an even handler you will be passed the element which triggered the event as this.

In an other example the `Array.prototype` functions, like
[`map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
or
[reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce),
you can pass a value of this on one of the arguments.

There are so many variations here that I'm not going to try and list them all.
THe moral of this story is, if your using something that takes a call back then have a look
and see if it `calls` or `apply`'s the function.
If it's not your code then consult the documentation.

Don't worry we're nearly there...

## In an arrow function `this` gets it's value from the enclosing scope

This is the last rule and it's the easiest.
It's the one that means `this` doesn't change from it's value at declaration.

In ES6 we got a new way to defined a function - the
["Arrow Function Expression"](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
.

Rather than using the keyword `function` you define an arrow function with `=>` for example:

```js
const something = (someArgument) => {
  console.log(someArgument);
};
```

One of the key differences between arrow functions and normal `function`s is in their handling of `this`.

**They do not have their own binding to `this`.**

If you refer to `this` in an arrow then the runtime will [look up through the
*declaration* contexts](https://262.ecma-international.org/#sec-getthisenvironment) until it finds one with a `this` binding.
So when you are writing the function you know what `this` will be.
Go up one scope, probably the line just before you started the arrow, and ask what `this` is there.
That is your answer.

Lets think about that for a minute.
I've just gone through 6/7 rules all of which are about how `this` gets a value from **the context in which it is run**.
That is hard to reason about.
When you write a function you often have very little idea how it will be used.
Maybe you do right now, there's the one case you're writing it to solve, but in future who knows.
Conversely when you use a function you don't know what's inside it.
Does it use `this`? :shrug:

Arrows flip that on it's head. When you write an arrow that uses `this` you know what you're going to get
anytime anything invokes your function.

OK, OK... examples:

```js
const something = () => {
  console.log(this === window);
};
something();
```

That will print `true`. `this` is `window` because that's the value it has in the parent scope.
Remember the first rule we discussed?
[Alone, `this` refers to the global object.](#alone-this-refers-to-the-global-object);
if we put the keyword `this` on the line just before the const it would be `window`.
So that's what it is in our arrow function.

```js
"use strict";
const something = () => {
  console.log(this === window);
};
something();
```

Still `true` - things are more consistent, easier to understand.

```js
class Fruit {
  constructor(type) {
    this.name = type;
  }

  press = () => {
    console.log(`${this.name} juice.`);
  };
}
const apple = new Fruit("Apple");
apple.press()

const doSomething = (callback) => {
  callback();
};
doSomething(apple.press);
```

We get two servings of "Apple juice" just like we ordered - `this` is the `apple` when the call is made directly.
The parent scope when the function was declared was the class, in the class `this` is the instance, `apple`.
(I just realised that's a rule I haven't covered - phew `this` is complicated.)
`this` is also `apple` when the function is passed as a callback.
Arrow functions are safe to pass around.

When you use `this` in an arrow function **it doesn't matter how it gets used**. It will always have the same value.
And you **know** what that value will be when you write it.

## Surviving `this`

OK so I promised some tips for surviving this madness and if you made it this far then you deserve some goodies.
So here we go:

1. Don't use `this`.
2. Use arrow functions.
3. Wrap functions you pass as callbacks in arrow functions.

That's it.

### Don't use `this`

OK, I'm being a bit flippant here but in general you should avoid using `this`.
If you are inside a class then it might make sense, but I think that is the *only* time it really make sense.
In general arguments are a much better place for passing values into functions.
They have names, they are easier to see & reason about.

So avoid using `this` where you can.

If this is part of the API (for example in
[DOM element event handlers](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Event_handlers#event_handlers_parameters_this_binding_and_the_return_value)),
then look for other options. For example in event handlers the argument will be an event object
and the triggering node then
[`event.target`](https://developer.mozilla.org/en-US/docs/Web/API/Event/target)
.
If you are designing an API which will take a callback - don't design it around `this`.

### Use arrow functions

Arrow functions solve a lot of the problems with this.
(I went into rant mode about this in the
[section about their rules for `this`](#in-an-arrow-function-this-gets-its-value-from-the-enclosing-scope)
so if you took my advice and skipped to the end then now is a good time to go back and have a look.
I won't subject you to it all again.)
If you use them instead of defining functions with the `function` keyword then you sidestep pretty much the whole issue.

### Wrap functions you pass as callbacks in arrow functions

What what am I getting at here? Consider this:

```js 10
const strawberry = {
  type: "Strawberry",
  makeSmoothie() {
    return `${this.type} Smoothie`;
  }
};

const placeOrder(makeOrder) {
  return makeOrder();
};

console.log(
  placeOrder(
    strawberry.makeSmoothie
  )
);
```

See how `makeSmoothie` is passed in as is?
We know that will cause a
[problem](#in-a-method-this-refers-to-the-owner-object)
by now right?
So don't.
Instead wrap it in an arrow function like this:

```js
console.log(
  placeOrder(
    () => strawberry.makeSmoothie()
  )
);
```

There are other reasons to do this.
Jake Archibald wrote a great blog post entitled
["Don't use functions as callbacks unless they're designed for it"](https://jakearchibald.com/2021/function-callback-risks/)
.
I highly recommend giving it a read.
But here's one he didn't mention.
If you pass a `function` as a callback then you might change it's `this`.
Especially if you can't see the definition of that function then you don't know what the author was expecting.
Did they use an arrow or a `function`?
Does it use `this`?
If it doesn't now will it in the future?
Will the person who adds a usage of `this` check all the places that function is used to make sure it's not passed unsafely?
It's defensive but you save yourself a lot of headaches by wrapping things in arrow functions as you pass them.
