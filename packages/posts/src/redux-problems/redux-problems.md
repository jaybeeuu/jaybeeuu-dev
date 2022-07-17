# The problem with Redux

## Intro & Conclusions

<!--
I won't use redux in my next project.
Why I won't use it next time.
It doesn't work well with react.
How should you use it?
What else is there?
Which will I choose next time?
-->

I've been thinking for a while about how we manage state in the application I maintain.
It's a large react/redux application with some high performance aspects.
We use Redux extensively.
I don't think that was a good choice.
In fact I think some of my reasons apply to smaller React applications, maybe all React applications.

Here's the headlines:

* It's hard to do well.
* Doing it well adds complication.

Hah, I thought that list would be longer.
Let's unpack it.

## What is Redux?

I want to start by building a (very) basic picture of what redux is.
It's not a complicated library and there's some really good docs to get you started, if you don't know it.
But to make sure we're all on the right page, i want to describe some of the basic principles of redux.

Redux's interface is beautifully simple. Make a store with `createStore`, then the 2 functions we are interested on it are
`dispatch` and `subscribe`.

Let's start from dispatch - this allows you to post "actions" into the store.
You can think of these as events.
They have a type, and a payload.

The store takes these little objects and pumps them through the "reducers".
These are functions you pass into `createStore`.
They define the state in your application, and how that state changes according to the actions dispatched to it.

Finally the `subscribe` function gives you a way to listen to the store, and react

What

## It's hard to do well

<!--
State adds complexity.
Separate derived state and incidental state
Selectors help that.
Redux knows when something changed, not what changes
All selectors need to recalculate
React works on the basis of referential equality
So Redux has set you up to fail.
-->



## So what can we do about that?

<!--
Only derive state in selectors and store the precursors
Add state management library
use memoisation
-->

## So what's the probem?

<!--
### Memoisation
Require some delicate handling
Avoiding memory leaks makes it a little like zombie code.

### Adding state management libraries
Sprinkling in alternate state management systems.
Adds state management systems.
-->


## Wrap up