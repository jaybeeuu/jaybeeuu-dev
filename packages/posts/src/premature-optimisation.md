How often have you spotted someone reaching for some fancy data structure or make a mutation or a side effect in an
unexpected place or some other dubious shortcut, and then brazenly defend it as "more performant"? Did they check?
Did it make a noticeable difference?

All performance optimisations come with a cost. It might be increased complexity or memory usage, slower writes or less
maintainable code but the cost is there and it's usually tangible. "So what?" I hear you ask -
"if it's faster it's faster!" Fine, but did you check? Was the difference perceivable to the end user? The cost of the
optimisation is only worthwhile if it actually improves the system enough and you will often be surprised *where* the
time is spent in your code, intuition is often wrong.

Here's a quick example. Have a look at this code:

```js
const numberOfIterations = 100_000;
const lengthOfString = 10;
const numberOfStrings = 100;
const numberOfAccesses = 5;

const charCodeOf0 = "0".charCodeAt(0);
const getRandomString = () => {
  return Array.from(
    { length: lengthOfString },
    () => {
      const randomInt = Math.floor(
        Math.random() * 79
      ) + charCodeOf0;
      return String.fromCharCode(randomInt);
    }
  ).join("");
};

console.time("Array");
for(let i = 0; i < numberOfIterations; i++) {
  const array = Array.from(
    { length: numberOfStrings },
    () => getRandomString()
  );

  for(let j = 0; j < numberOfAccesses; j++) {
    array.includes(getRandomString());
  }
}
console.timeEnd("Array");


console.time("Set");
for(let i = 0; i < numberOfIterations; i++) {
  const array = Array.from(
    { length: numberOfStrings },
    () => getRandomString()
  );
  const set = new Set(array);

  for(let j = 0; j < numberOfAccesses; j++) {
    set.has(getRandomString());
  }
}
console.timeEnd("Set");
```

OK what am I up to?

* `getRandomString` is generating a `lengthOfString` character string of the 79 characters between `0` and `~`,

* Next we have two timed for loops; bracketed by the `console.time()` and `console.timeEnd()` calls.
  * The first, between `console.time("Array");` and `console.timeEnd("Array");`,
    * uses `getRandomString` to generate an array of length `numberOfStrings`
    * Tries to discover if another random string is in that array `numberOfAccesses` times.
  * The second, between `console.time("Set");` and `console.timeEnd("Set");`,
    * Uses `getRandomString` to generate an array of length `numberOfStrings`.
    * Then, because we want to efficiently see if strings are in the array,
      writes the thing into a
      [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
    * Tries to discover if another random string is in that array `numberOfAccesses` times.

Why a set in the second case?
Well
[`Array.prototype.includes`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)
(used to check if the argument is present in the array)
is somewhat naive.
It iterates through the array and does a simple equality check.
The first time something is equal it quits the loop and returns true.
If it gets to the end and no member was equal then it returns false.

This isn't great, it's an
[`O(n)`](https://www.bigocheatsheet.com/)
operation.
I.e. for each check you have to iterate the array, the work done scales with the number of elements in the array.
You might get lucky and be the first element or unlucky
(we will overwhelmingly be unlucky since the random string is unlikely to be in the array)
and have to iterate the whole array.

So to speed things up and make our site, API, cli tool, what have you perform better we could use a
[`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
.
It's similar to an array in that you can iterate though the members in insertion order,
but you are guaranteed uniqueness;
no two members will have the same value.

You can test that by doing this in the node repl or browser console...

```js
console.log(new Set(["a", "b", "a"]).size);
```

It prints 2 rather than 3.
When the second `"a"` is inserted the set sees that it already has that value and discards it.
Cripes is it doing includes on every insertion?
That would make insertions awful in a big set...

Fortunately the clever people who have gone before have our backs.
According to the
[spec](https://tc39.es/ecma262/#sec-set-objects)
Sets "must be implemented using either hash tables or other mechanisms that, on average,
provide access times that are sublinear on the number of elements in the collection".

Ok I don't want to go into too much detail here.
Suffice it to say that a [hash table](https://en.wikipedia.org/wiki/Hash_table) is a bit like and object,
but instead of using a string as a key you use a number derived from the value it's self.
THe up shot is that instead of being `O(n)` (linear) to access they are `O(1)`.
That's better!
rather than the access taking longer the more elements you put in the thing they always take (roughly)
the same amount of time.

OK So... going back to the code... if you run it which version will be quicker; the `Set` or the array?

On my machine this is the result (I'm using node v14.15.1, but i tried it in Firefox and Chrome too):

```txt
Array: 14.028s
Set: 16.240s
```

The array is just over 2 seconds quicker.
Surprised?

Now I must admit that I have tuned the inputs a little here, but what has gone on?

The array's `includes` function iterates through the members and compares the strings. Meanwhile the `Set` is
calculating a hash of the string, then looking in it's map to see if that hash exists. Intuitively the `Set` should be
quicker; it's an `O(1)` operation compared to the `O(n)` of the array. Even worse since the random strings almost
certainly won't exist in the array or the `Set`, this is worst case for the array: It has to check every string before
it can quit and return a result (`false`). Whereas `Set` is on it's home turf - it always just does one check.

But the `Set` is still slower in this circumstance. Clearly intuition is wrong.

The problem is the cost of the optimisation. The hash calculation isn't free. In this case (relatively few, short
strings and a low number of accesses)
it is actually more expensive than the array iteration and string comparisons. Hrn... Optimising early and
using a `Set` would, in this case, have slowed our code down by 15%. Worse, in order to make the `Set` you must first
have the array.

Would you have guessed that from the code? I certainly wouldn't have. Only by actually doing the test do we
discover the pitfall. Meanwhile reaching for the more familiar array first off would have meant a less obscure data
structure and faster code. What's not to love?

Of course, it doesn't take much fiddling with the constants at the top of that sample to make the `Set` far out
perform the array. But even then...  how much faster is it?
In your application how many times will the thing run in your applicatin?
Is it worth it?
Worse - is that really the least performant bit of your codebase?
Would you be better spending the dev time & complexity budget elsewhere and for a much bigger pay off?

All of this is not to say that you should never optimise for performance.
I once figured out that a bit of code I wrote was going to take ~8 days to complete.
(I didn't actually wait that long; I'm too lazy.
I timed a little bit of the calculation and estimated from that.)
That was unacceptable.
I cracked out the profiler, had a look at where the bottlenecks were.
I changed my data structure and by the time I was finished it took less than 20 seconds.
That is not to be sniffed at, to me, as the end user,
the thing went from a waste of electricity to something worthwhile.

But there was a cost - complexity.
I had to get my head around a less familiar data structure
(it wwent from plain old arrays treated to a linked list).
That data structure needed to be mutated in place (better for memory & less GC),
so there were weird mutation bugs I had to track down.
The rest of the project treated most data structures as immutable so that was a deviation.
There was also more code; more places it could go wrong and more for me to maintain.

In this instance the benefit outweighed the cost - it *was*, undeniably, faster.
But in so many other situations you won't even notice difference,
and sometimes... despite your best intentions... you will make things worse.

So please - don't fall into the trap of
[Premature Optimization](https://en.wikipedia.org/wiki/Program_optimization#When_to_optimize).
Wait until you have **noticeable, profiled, performance problems**.
