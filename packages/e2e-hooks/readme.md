# e2e-hooks

Exports css classes which can be used to "hook" elements on the page in order to select them in end to end tests.

I like to separate out the concerns of styling my components (I use react at the moment)
and selecting elements to assert on or interact with in my UI end to end (E2E) tests (I use Cypress).
So rather than using CSS classes to apply both styles and select elements in E2E,
I add classes to style our elements (style classes) and *also* add different classes for use in E2E (E2E Hooks),
when I need them.
If you inspect a couple of elements on [my blog](https://jaybeeuu.dev) (try the buttons in the navbar/header) you'll see them;
they are the classes that start `e2e__`.

This is good.
I am free to restyle components or elements or refactor the classes I apply without breaking my tests.
Tests that don't need to change as a result of refactors bring more _value_.

## BEM

A fly in the ointment is that we need to have unique class names because CSS classes are globally scoped.
For style classes I use CSS modules (which are fantastic) but that would be awkward as E2E hooks,
since the hooks,
by definition,
don't exist in style sheets.

So instead I revert to an old tactic for scoping CSS classes.

[BEM](http://getbem.com/naming/)
is a naming convention defines a series of rule for giving your classes names to avoid naming collisions
and improving readability.

I don't want to get too deep but understanding BEM a little is important to grokking the use case.

BEM stands for Block Element Modifier.
The idea is that your CSS classes will be made up of combinations of those three things.
This does a couple of things.
For one it's _a_ convention, so naming becomes more consistent.
Also it give you some concept of scoping and so helps to avoid the global CSS classes problem.

Blocks are top level containers; "a stand alone entity that is meaningful on its own".
For example you might have an image carousel letting you display a sequence of images on your site.
The root CSS style of that might then be the "carousel" block.

Elements are sub components of the Block.
For example our carousel might have images or
a series of dot-buttons to select the images/show which is active.

Finally Modifiers are roughly "states" of the elements or blocks.
Maybe a carousel's images are animating in and out of sight
or the one of the dot buttons is active to indicate that is the current image.

To make up a CSS class using these we join them with various delimiters:

```css
.carousel__dot-button {
  color: grey;
}

.carousel__dot-button--active {
  color: white;
}
```

In this example the class indicates the `carousel` block's `dot-button` element which is currently in `active` state.
The segments are joined with `__` to indicate an element, and `--` to indicate a modifier.

The rules are simple, but pretty effective at manually scoping the classes.