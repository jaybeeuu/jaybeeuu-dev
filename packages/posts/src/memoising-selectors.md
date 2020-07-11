# Memoising Selectors

In general don't fall into the trap of [Premature Optimization](https://en.wikipedia.org/wiki/Program_optimization#When_to_optimize). So look for where you are seeing performance problems before you start worrying about it.

In the case of your selectors they might need to be memoised if you are calculating values based on the store, because that might cause your react components to rerender. The answer in this post is a really good way to find out if you need to worry about it.

But it also helps to understand what you are trying to do:

Memoising selectors is aimed at letting react know it doesn't have to rerender the component. Remember that Every time *any* part of the redux store changes all of your conneted components will get a notification and will try to rerender. If you let it it can be quite costly. SO it si a good idea to avoid it if possible.

The easiest way to tell a component not to rerender when it's props (e.g. because of a store update) or state change do this is to use ([PureComponents](https://lucybain.com/blog/2018/react-js-pure-component/)) or [Pure](https://logrocket.com/blog/pure-functional-components/). This is so simple i would argue it doesn't count as premature optimisation and could be your default. These components look at the new Props and State and compare them to the last lot the only rerender if there is a difference. But the comparison they do is a simple instance comparison - partly because it is super quick. So:

```js
const a = ['a'];
const b = a;

console.log(a === b); // prints true because a and b both reference the same instance in memory.

const c = ['a'];
console.log(a === c); // prints false because even though the data is the same, because c has declared a new array in memory.

//  This only applies to objects, functions and arrays (which are special objects). not numbers or strings so:
const d = 1;
const e = 1;

console.log(d === e); // Will print true.
```

This fits really well with redux because one of the basic principles of the store is that the data in there is immutable. i.e. if you want to change a part of the state (at any level) then you create a new instance of the state, rather than mutate the existing object. e.g.

```js
const state = {
 'a': {
    'b': 10
  }
};

// In order to change b to 11 i could do:

state.a.b = 11;

// but that mutates the object and redux will assume nothing has changed. so instead I do:

const newState = {
  ...state,
   'a': {
     ...state.a,
     'b': 11
   }
};

// (this is what your reducers do)

// so now if i pass a into a react component (via a selector) then it can do:
if (newA !== oldA) {
  rerender();
}
```

So redux takes care of most of that, but if you are calculating something based off the redux store in your selector e.g.

```js
const getEnabledUsers = (state) => state.users.filer(user => user.enabled);
```

`getEnabledUsers` will return a new array instance every single time it runs. And if you use it in `mapStateToProps` it will run every time you change *anything* (not just users) in the store, and inturn your react component will rerender every time. And if your whole app does that then that is bad.

Memoisation to the rescue.

If state is immutable and the `users` array in state must be a different instance if the data has changed and checking instances is cheap. So if we see the the same instance as last time we ran this function then we can return the same result as before.

```js
const previousUsersInstance = [];
const previousEnabledUsers = [];
const getEnabledUsers = (state) => {
  if (previousUsersInstance !== state.users) {
    previousUsersInstance = state.users;
    previousEnabledUsers = state.users.filer(user => user.enabled);
  }
  return previousEnabledUsers;
}
```

Now react will only rerender if the users array has actually updated.

But it is a bit complicated and a hassle to write that memoisation, and it has a nonzero memory footprint. So don't do it if you don't need to and when you do then it's best to use  a library like [reselect](https://github.com/reduxjs/reselect) and [rereselect](https://github.com/toomuchdesign/re-reselect) to avoid the boiler plate and keep you code expressive.
