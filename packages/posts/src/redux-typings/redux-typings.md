# Redux Slice Types

Redux is a popular state management framework based on the Flux Architecture.
It's often used in React applications.
I've been working with it for the last few years.
It's a powerful framework (albeit with some problems) and has some great tooling around it.

The types can be tricky though.
In the reducer action handlers in particular type safety is hard work
or when you introduce `redux-thunk` you can end up with some sticky circular dependencies.

I've figured out some patterns that I like, you can find them below.

## Goals

1. Intellisense and type safety everywhere possible.
2, Slices decide their own fate.
2. Dependencies are clear.

## Slice Anatomy

Personally I think the basic components of a slice of the store are:

* Action Handlers
* Selectors
* Action creators
* Initial State

This is a bit more than is strictly necessary.
But I have found that thinking about the slices in this way leads to some good patterns and
## Store Anatomy

## Thunks

## Selector Types

## Hooks
