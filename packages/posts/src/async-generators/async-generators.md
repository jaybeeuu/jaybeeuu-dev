# Promise Status

I've been reading a little about the upcoming, much anticipated,
[Suspense](https://reactjs.org/docs/concurrent-mode-suspense.html)
and [concurrent mode](https://reactjs.org/docs/concurrent-mode-patterns.html)
in react.
I think it sounds really powerful, and it's going to be great to have those API's to allow us to build great user experiences.

It's also not far from something I was playing with a little while ago.
I was using Async iterators to notify UI components of the state of promises.
And I was doing it for the same reason,
I wanted to build a good user experience around loading some data.

I thought I might share what I ended up with with.
I think the API ended up being pretty neat and it's a good excuse to explore async iterators.

## The Problem

Loading something async can take an undetermined amount of time.
It might be long or short.
You won't know until it arrives.
In the mean time your app has to do something,

Promises are in one of 3 basic states.
`Pending`, `Resolved` or `Rejected`.

The promise starts of as `pending`.
That's when we've begun waiting for whatever it is.
Maybe we've sent the request or asked the browser to copy the data.

Resolved and rejected are both terminal states.
i.e. the promise won't change once it arrives there.

* `Resolved` - success, the data has arrived.

* `Rejected`: bad news.
  Something has gone wrong. An error has occurred..

To build a good UI around these three states seems simple enough.
Throw a spinner up in `pending`, show the content in resolved and an error message in rejected.
But a really slick UI turns out not to be as simple as that.
Especially when your requests are *usually* medium fast.
Say sub second.

Let's imagine a scenario.
The user clicks on a link maybe to the blog post they want to see. The app changes the route on the page,
which causes a transition to another page.
That page requires some data and so it begins to load.
Finally the data arrives and he new content is displayed.
(This is the waterfall of data loading that is described on the react post about suspense as being bad.
I agree but I haven't quite figured out how a page or component,
can be clairvoyant enough to know what data the next page might need yet...
Maybe all will become clear when react 18 comes along.)

So here we have 2 transitions.

```log
Old Page -> spinner -> new page.
```

That's a bit busy. but it's not too bad if the transitions are spaced out.
the user has time to notice and appreciate what's happening.
Otherwise those transitions seem flickery and un useful.

Do I really need a loading spinner if i end up looking at it for less than half a second before the page loads properly?
or is it just adding visual noise and a sense of instability & disjointedness to the page?

I think the later.
So let's add a 4th state.

## The Fourth State

Flickery multi stage changes make the user experience feel a bit... shoddy.

Let's introduce a fourth state. Now we are `pending`, `slow`, `resolved` or `rejected`.
When the request starts it will be in `pending` state.
Then after a timeout of a relatively short amount of time we'll go to `slow`.
Finally the promise will either `reject` or `resolve`.

How does this help?
Well we'll only show the loading spinner when the promise is in `slow`.
In `pending` there will be no spinner, and therefore no flicker of ui states.

We could even go on e step further.
If, once we have gone in to `slow`,
we consciously delay `resolved` or `rejected` for long enough that the spinner is there for a decent amount of time,
then the loading experience will be smoother, less jarring.
Sure it might take a little langer,
but we are talking a delay of an additional half a second and,
it gives a better feel to the product.

This makes some mathematical sense too.
It turns out that on average you can expect to wait for a promise to resolve for as long again as you have waited for it.
So say you have waiting 300ms, you can expect to wait another 300ms.
So then if we show the loading spinner after 400ms,
and delay the resolve by another 400ms.
Half the requests won't actually be delayed at all,
and the other half by less that 400ms.

So while it seems counter intuitive it actually can make the product feel more polished, with little impact on actual wait times.



