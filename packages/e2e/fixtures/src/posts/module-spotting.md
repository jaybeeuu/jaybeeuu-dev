# Module Spotting

## What are we trying to solve?

As JS applications grow managing them in a single file becomes unwieldy. We all know the benefits of breaking things down into small easliy understood cohertent components which can be editted with confidence. In the old days JS had no builtin way of doing this.

The best attempt in the browser was to "import" modules using a series of script tags from you html. This encouraged large JS files, whose dependencies often weren't clear. If the dependencies changed there was no automatic way to go and update all of the places they were used, and the order of imports was sacrosanct. Utility files in projects would grow and grow and often be imported on every page. dead code was hard to identify and eliminate.

Because there was no definition of a module there was also no definition of how a file should export public code. The global scope was the only real choice and soon became a dumping ground. Of course this quickly led to name collisions and javascript being what it is - `dynamic` that perfectly OK from the point of view of the interpreter. Even Libraries like `jQuery` and `Underscore` whose exports and aliases were well known ran into others using their names. Techniques were used like namespacing to try and avoid collisions, but inevitably someone would overwrite someone elses behaviour, bugs ate up whole applications, tempers flared and words were said which could never be taken back.

Something had to give. A few competing standards grew each with their own quirks and benefits. But the good news is that you don't need to know all of them. The two you will come in most contact with are CommonJS and ES6 Modules - and even then mostly only ES6 modules. The others are included below only because you may some across them so it's worth at least recognising the names and the syntax.

## So what actually is a module anyway?

The Google definition is:

> module
> /ˈmɒdjuːl/
>
> noun
>
> 1. each of a set of standardized parts or independent units that can be used to construct a more complex structure, such as an item of furniture or a building.
>    - "ships are now built in modules rather than built in a whole from the base up"
> 2. a detachable self-contained unit of a spacecraft.
>    - "Spacelab, an extra module for the shuttle, will quadruple the experimental facilities on board"

The first definition is more relevant to JavaScript. A module is a unit of code which provides some cohesive reusable functionality. It might export a class or a group of functions. But whatever it contains should be closely related. In a similar fashion to classes in OO languages (like Java or C#) modules in javascript allow us to build up complex applications from smaller simpler components.

A module in JS allows the author to import the dependencies of the code they define - i.e. the modules on which the module's code relies. (It's turtles the whole way down.) It must then allow the execution of some JavaScript which defines the exports of the module i.e. what should be available to the outside world. Usually a group of functions or a class but the exports could just as easily be a configuration object some HTML or CSS. Along the way modules allow code to be defined only for internal use - think `private` in OO languages. If it isn't exported other modules have no knowledge of it. This gives us the [encapsulation](https://en.wikipedia.org/wiki/Encapsulation_(computer_programming)) that JS otherwise lacks.

## Styles of Module you might see in the wild

### [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition)

Asynchronous Module Definitions. Most notably implemented by [Require.js](https://requirejs.org/). One of the key features of this standard is to allow modules to be loaded in a lazy manner - i.e. as late as possible. The goal being to increase page load times by not loading anything until it is required.

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

The key here is the `define` function on line 1. `RequireJS` wraps the module code and supplies a couple of variables to use to define your exports and dependencies. `define` tells `RequireJS` you are going to define a module. The first arguemnt is an array of the dependencies. These are either relative paths to the modules or an alias ike `jQuery` which is defined in requires config. The second argument is the function to run to perform the module definition. It's arguments are the dependencies and that is how require gets them into your code.

At the end of the definition function `return Cat;` defines the export of the module (the `Cat` class).

The syntax is complex, setting it up is finicky and it's not a popular way of doing modules anymore so let's not dwell on it. But it is a bit like a penny-farthing - no one likes to use it anymore, but every now and again you see one in the street it's fun to point at it and wonder about how anyone came up with such an invention...

Having said that a time when you might see something like this is if you are debugging some code which has been bundled by webpack, without source maps, and it has been configured to have an `AMD` style output so it does show up every now and again.

### [CommonJS](https://en.wikipedia.org/wiki/CommonJS)

Because this is the module system implemented by [Node.js](https://nodejs.org/en/) it is more likely you will come across it. It's also worth pointing out that code transpiled and bundled by `webpack` is converted into modules with a `CommonJS` flavour so you can come across it in the browser too. It is definitely worth getting into some detail about this one.

The way this works is that when node executes the JS in a module it wraps the code in a function. The function  supplies a couple of special arguments which the module can use. More details can be found [here](https://nodejs.org/docs/latest/api/modules.html#modules_the_module_wrapper). But the important ones for the sake of this discussion are `exports`, `module` and `require`.

Here's an example ripped almost exactly from the [node docs](https://nodejs.org/docs/latest/api/modules.html)...

```js
// circle.js
const { PI } = Math;

exports.area = (r) => PI * r ** 2;

exports.circumference = (r) => 2 * PI * r;
```

Here are two functions which are exported as named exports on the `exports` object. This makes them accessible to the outside world. The `exports` object though is just a shortcut to the `module.exports` object so you can do the same thing like this:

```js
module.exports.circumference = (r) => 2 * PI * r;
```

Lets have a look at the other end of this and see how the modules are consumed:

```js
// index.js
const circle = require('./circle.js');
console.log(`The area of a circle of radius 4 is ${circle.area(4)}`);
```

On the first line you can see the `require` function being used to import the `circle` module. After it has been executed the `circle` const will contain a reference to the object that was on `module.exports` once the circle code had been executed. In this case `area` and `circumference`. Note that the argument to `require` is a relative path from the current module (`index`) to the required module (`circle`) in this example they must be nxt to eachother in the same directory to work (`.` in a relative path refers to the current directory, `..` navigates up the tree etc.).

Another common way to define an export is to write directly to the `module.exports` property. Thus defining the "default export".

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

The square class is written straight onto the `module.exports` property and so becomes the only export which this module defines. So when it is required it can be accessed directly:

```js
// index.js
const Square = require('./square.js');
const square = new Square(2);
console.log(`The area of a square with width 2 is ${square.area()}`);
```

A thing to note here is that the `exports` argument is a short cut to the `module.exports` property, but it is the `module.exports` object which actually gets passed to the dependents. Therefore if you overwrite it anything which is written to `exports` will be ignored and only things written to `module.exports` after it has been overwritten will be available...

```js
// missingModule.js

exports.a = function () { console.log('Can\'t touch this'); };
module.exports.b = function () { console.log('Nah na na na, nah na, nah na'); };

module.exports = {
  c: function() { console.log('This had better do all those other things...'); }
};

module.exports.d = function() { console.log('hmmm... something\'s missing.'); }
exports.e = 'A message of love and peace an how we can all just get along if we tried.';
```

In this case any module importing `missingModule` will only ba able to use `c` and `d` because `a`, `b` `e` were defined on an object which will have been tied up by the garbage collector... For this reason you should be cautious about mixing `module.exports` and `exports` and in general only use one or the other.You might also see this: `module.exports = exports = ...` which allows `exports` to be used _after_ `module.exports` has been set. Still anything written to it before will be lost.

On the whole though `CommonJS` is a reasonably good module system it's syntax is terse and there aren't many gotchas. It has a clean syntax and the `require` statements which pull in code can go anywhere in the file which can lend readability. On the down side the `require` statements can go anywhere so the dependencies of a file are not necessarily obvious. We haven't talked about cyclic dependencies (module A depends on B depends on A) but `CommonJS` [handles](https://nodejs.org/docs/latest/api/modules.html#cycles) them reasonably robustly.

#### Running the Examples

If you want to play around with this style of module a bit then you can find some of the examples above in the `node-examples` directory in the root of this project.

running `npm run examples` will run `node-examples/index.js` in node, and you can start it with a debugger with `npm run examples:debug`.

### [UMD](https://github.com/umdjs/umd)

UMD (Unified Module Definitions) aims to join both - library authors needed to wrap their code up as modules which worked in as many environments as possible and so UMD was born. At it's core is a series of templates in a github [repo](https://github.com/umdjs/umd). They work fine - but getting your head around what they do can be tricky.

Here's an exmaple:

```js
// commonjsStrictGlobal.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'b'], function (exports, b) {
            factory((root.commonJsStrictGlobal = exports), b);
        });
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        factory(exports, require('b'));
    } else {
        // Browser globals
        factory((root.commonJsStrictGlobal = {}), root.b);
    }
}(typeof self !== 'undefined' ? self : this, function (exports, b) {
    // Use b in some fashion.

    // attach properties to the exports object to define
    // the exported module properties.
    exports.action = function () {};
}));
```

So in that first top level indentation (line 2-14) you can see this thing doing some testing to effectively see what is going on in it's environment. First it tests to see if it's AMD with `typeof define === 'function'`, then `CommonJS` (`if (typeof exports === 'object')`) and finally it falls back to assuming it's dependencies must be defined in the global scope.

Once if knows what the module system is it injects the `exports` object and the dependencies into the actual module definition function (lines 15-22, the second top level indentation).

Again this isn't a module definition type that you are likely to come across regularly, unless you look at the source code of some older libraries, so don't worry too much. If `AMD` is a penny-farthing then I suppose `UMD` is a reasonably priced car with a penny-farthing bolted on one side and a horse tied to the other. Let's move on.

### [ES6 (Harmony)](http://exploringjs.com/es6/ch_modules.html)

This is the one to pay most attention to. This is the officially sanctioned module standard as per the ES6 specification. It has taken a while but many browsers now [support](https://caniuse.com/#search=modules) the spec. Because of [differences](https://hackernoon.com/node-js-tc-39-and-modules-a1118aecf95e) between node's CommonJS and ES6 modules it has taken longer for modules to be supported there, but it is now on it's [way](https://nodejs.org/api/esm.html).

If you have tp support older browsers or want to use ES6 modules in node today then you can do that too. Tools like `webpack` with `babel` or `babel-node` will let you do just that. These tools replace some reference sand keywords and wrap your code in a function that convert the statements to `CommonJS` or `AMD` style modules.

Lets get down to brass tacks...

```js
// circle.js
const { PI } = Math;

export const area = (r) => PI * r ** 2;

export const circumference = (r) => 2 * PI * r;

export const diameter = (r) => 2 * r;
```

In this adaptation of the circle example you can see 3 things being exported. The `area`, `circumference` and `diameter` functions are *named exports* from this module to access them you must use curly braces in your `import` statement. Like this:

```js
import { circumference, diameter } from './circle.js'

console.log(`The circumference of a circle of radius 4 is ${circumference(4)}`);
console.log(`The circumference of a circle of radius 2 is ${diameter(2)}`);
```

I import more than one named export by using a comma - this should look familiar from object spread syntax. I don't have to import everything if i don't want to - this module only uses `circumference` and `diameter` so those are the only exports I reference. If  you do want everything you can do that too with a `* as`:

```js
import * as circle from './circle.js'

console.log(`The circumference of a circle of radius 4 is ${circle.circumference(4)}`);
console.log(`The circumference of a circle of radius 2 is ${circle.diameter(2)}`);
```

If I want to use a different name (perhaps to avoid a collision with another module) for the export in the dependent module then i can do that too - but the syntax diverges from the object spread syntax:

```js
import { area as circleArea } from './circle.js';
import { area as triangleArea } from './triangle.js';

console.log(`The area of a circle of radius 4 is ${circleArea(4)}`);
console.log(`The area of a triangle of base 4 and height of 2 is ${triangleArea(4, 2)}`);
```

We can define a default export for the module. Which is often used when the module exports a `class` or a single object. the `square` module below does that:

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

Here the `default` keyword has been used as well as `export`. Not much more to say about that really. Importing the default is simple too - just omit the curly braces and you get the default:.

```js
import Square from './circle.js'

const square = new Square(2);
console.log(`The area of a square with width 2 is ${square.area()}`);
```

In the case of the default you can call the import whatever you like so if you need to us `as` if you want to call it something different in the dependent module.

The final case is one where you have both named and default exports. Like in the slightly contrived triangle module below...

```js
// triangle.js
export const area = (base, height) => 1/2 b * h

class Triangle {
  constructor(base, height) {
    this.area = () => area(base, height);
  }
}

export default Triangle
```

```js
import Triangle, { area } from './triangle.js';

const triangle = new Triangle(4, 2);
console.log(`The area of a triangle of base 4 and height of 2 is ${area(4, 2)}`);
console.log(`The area of a triangle of base 4 and height of 2 is ${triangle.area()}`);
```

Again you don't have to import everything so if you only want either default or named exports then that is fine. Also the name exports will behave themselves if you want to use `as` or `* as` with or without the default export as you would expect.

Once you get started with ES6 imports they are pretty clear. The syntax is reasonably simple and they are flexible enough to allow you to do what ever you need with them. If you dig into the [details](http://exploringjs.com/es6/ch_modules.html#sec_cyclic-dependencies) a little then they also handle cyclic dependencies better than `CommonJS` too. There is also support for async loading of modules out of the box, in a similar manner to `AMD`. We're getting the best of both here!

#### Running the Examples

If you want to play around with this style of module a bit then you can find some of the examples above in the `public/browser-examples` directory in the root of this project. These are served up by express so run `npm run start` and open `http://localhost:3000` in a modern browser (see the caniuse link above for details of supported versions). It will open this readme and if you look in devtools you will be able to see the modules being loaded (checkout the network tab) and executed (see the console and sources tabs) natively in your browser...
