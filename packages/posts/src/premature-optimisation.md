How often have you spotted someone reaching for some fancy data structure or make a mutation or a side effect in an unexpected place or some other dubious shortcut, and then brazenly defend it as "more performant"? Did they check? Did it make a noticeable difference?

All performance optimisations come with a cost. It might be increased complexity or memory usage, slower writes or less maintainable code but the cost is there and it's usually tangible. "So what?" i hear you ask - "if it's faster it's faster!" Fine, but did you check? Was the difference perceivable to the end user? The cost of the optimisation is only worthwhile if it actually improves the system enough and you will often be surprised *where* the time is spent in your code, intuition is often wrong.

Here's a quick example. Have a look at this code:

```js
const numberOfStrings = 100;
const lengthOfString = 10;
const numberOfIterations = 10_000_000;

const charCodeOf0 = "0".charCodeAt(0);
const getRandomString = () => {
  return Array.from({ length: lengthOfString }, () => {
    const randomInt = Math.floor(Math.random() * 79) + charCodeOf0;
    return String.fromCharCode(randomInt);
  }).join("");
};

const array = Array.from({ length: numberOfStrings }, () => getRandomString());
const set = new Set(array);

if (array.length !== set.size) {
  throw Error("Rats. You ended up with a duplicate");
}

console.time("Set");
for(let i = 0; i < numberOfIterations; i++) {
  set.has(getRandomString());
}
console.timeEnd("Set");

console.time("Array");
for(let i = 0; i < numberOfIterations; i++) {
  array.includes(getRandomString());
}
console.timeEnd("Array");
```

Ok what am I up to?

 * `getRandomString` is generating a `lengthOfString` character string of the 79 characters between `0` and `~`,
 * We make an [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) of length `numberOfStrings` seeded with `getRandomString`.
 * Then use the array to make a [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).
 * Next we check the lengths are the same. If we had duplicate strings in the array (very unlikely) then the `Set` would have an advantage, since it dedupes the data, and I want you to believe the results...
 * Now we begin timing, see if the `Set` [`has`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/has) a random string `numberOfIterations` times in the `Set` and end that timer.
 * Finally begin a new timer, see if the array [includes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes) a random string `numberOfIterations` times and end the timer.


The question is... if you run it (I'm using node v14.15.1) which version will be quicker: the `Set` or the array?

On my machine this is the result:

```
Set: 15.058s
Array: 14.006s
```

The array is just over 1 second quicker. Surprised?

Now I must admit that I have tuned the inputs a little here, but what has gone on?

The array's `includes` function iterates through the members and compares the strings. Meanwhile the `Set` is calculating a hash of the string, then looking in it's map to see if that hash exists. Intuitively the `Set` should be quicker; it's an `O(1)` operation compared to the `O(N)` of the array. Even worse since the random strings almost certainly won't exist in the array or the `Set`, this is worst case for the array: It has to check every string before it can quit and return a result (`false`). Whereas `Set` is on it's home turf - it always just does one check.

But the `Set` is still slower in this circumstance. Clearly intuition is wrong.

The problem is the cost of the optimisation. The hash calculation isn't free. In this case (relatively few, short strings) it is actually more expensive than the array iteration and string comparisons. Hrn... Optimising early and using a `Set` would, in this case, have slowed our code down by 7.5%. Worse, in order to make the `Set` you must first have the array. My metrics suggest it costs something like 0.2s more to make the `Set`.

Would you have guessed that from the use case? I certainly wouldn't have. Only by actually doing the test do we discover the pitfall. Meanwhile reaching for the more familiar array first off would have meant a less obscure data structure and faster code. What's not to love?

Of course, it doesn't take much fiddling with the constants at the top of that sample to make the `Set` far out perform the array. But even then...  how much faster is it? Hundreds of ms when you iterate millions of times? Is it worth it? How realistic is that test? And is that really the least performant bit of your codebase? Would you be better spending the time & complexity budget elsewhere and for a much bigger payoff?

All of this is not to say that you should never optimise for performance. I once figured out that a bit of code I wrote was going to take ~8 days to complete. (I didn't actually wait that long; I'm too lazy. I timed a little bit of the calculation and estimated from that.) That was unacceptable. I cracked out the profiler, had a look at where the bottle necks were. I changed my data structure and by the time I was finished it took less than 20 seconds. That is not to be sniffed at, and more importantly, to me, as the end user, the thing went from a waste of electricity to something worthwhile.

But there was a cost - complexity. I had to get my head around a less familiar data structure (plain old arrays to a linked list). That data structure needed to be mutated in place (better for memory & less GC), so there were weird mutation bugs I had to track down. The rest of the project treated most data structures as immutable so that was a deviation. There was also more code; more places it could go wrong and more for me to maintain.

In this instance the benefit outweighed the cost - it *was*, undeniably, faster. But in so many other situations you won't even notice difference, and sometimes... despite your best intentions... you will make things worse.

So please - don't fall into the trap of [Premature Optimization](https://en.wikipedia.org/wiki/Program_optimization#When_to_optimize). Wait until you have **noticeable, profiled, performance problems**.