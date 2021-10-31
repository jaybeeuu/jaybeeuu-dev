# Promise Status

I've beeen reading a little about the upcoming, much anticipated,
[Suspense](https://reactjs.org/docs/concurrent-mode-suspense.html)
and [concurrent mode](https://reactjs.org/docs/concurrent-mode-patterns.html)
in react.
I think it sounds really powerful, and it's going to be great to have those API's to allow us to build great user experiences.

It's also not far from something I was playing with a little while ago.
I was using Async iterators to notify consumers of the state of promises.
I was doing it for the same reason,
I wanted to build a good user experience around loading some data.

I thought I might share what I ended up with with.
I think the API ended up being pretty neat and it's a good excuse to explore async iterators.

## The Problem

Loading something async can take an undetermined amount of time.
It might be long or short.
You won't know until it arrives.
In the mean time your app has to do something,
then once the promise is resolved you will need it to render

## The Fourth State

Flickery multi stage changes make the user experience feel a bit... shoddy.

Imagine we've got a page when you click a button on the page it's going to make a request to grab some data.
That request might take a long time, or it might be quick.
Because you don't want to be left wondering
while the request come back the app renders a spinner while you wait.

So when it's slow the interaction looks something like this:

{TODO: MAKE GIF OF LOADING WITH A SPINNER 5000ms}

That looks kind of neat.
We see something is on it's way, then it turns up and we're away.

But what happens if the request is fast?

{TODO: MAKE GIF OF LOADING WITH A SPINNER 300ms}

OK there was something that happened but it was a bit too quick to spot.
It get's worse in the middle ground.
The spinner shows up for enough time to notice, but not enough that it's worthwhile.
This kind of thing makes the API *feel* slow, even though really it's probably fine.
You've been told it's slow - otherwise why the spinner?

Our server teams probably deserve all the credit for speeding things up. let's make sure they get it.

Let's introduce a fourth state. Now we are `pending`, `slow`, `complete` or `error`.
When the request starts it will be in `pending` state.
Then after a timeout of a relatively short amount of time we'll go to `slow`.
Finally the promise will either reject or resolve and we'll go to `error` or `complete`.

How does this help? Well we'll only show the loading spinner when the promise goes to `slow`.
In `pending` there will be no spinner, and therefore no flicker of ui states.

We could even go on e step further.
If, once we have gone in to `slow`,
we consciously delay `complete` or `error` for long enough that the spinner is there for a decent amount of time,
then the loading experience will be smoother, less jarring.
Sure it might take a little langer,
but we are talking less that half a second and,
it gives a better feel to the product.
Personally i think it's worth it.

