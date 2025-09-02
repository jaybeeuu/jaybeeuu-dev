# Over Engineered

This site is a little over engineered. OK... a lot over engineered.
If you want to see the code it's available in [GitHub](https://github.com/jaybeeuu/jaybeeuu-dev).

It's a blog, but for some reason it's a Preact application with a homegrown recoil like state management library.
It uses a custom Webpack configuration, with a self authored Webpack plugin for the RSS feeds.
The posts are built from markdown using a CLI wrapper around marked.js.
All of this is linted to within an inch of it's life and tested with jest driven unit tests and cypress E2E tests,
run in CircleCI on every commit.
It's static assets are published with Cloudflare Pages.

That is a lot over engineered, and it's not how you should build a blog.
There's too much code to maintain.
Some of the code would be better replaced by existing libraries,
written, tested and maintained by the good people of the open source community.
You'd get better performance by serving the whole thing as static assets, rather than an SPA.
(Given the scale of the app The testing is just prudent.)

If you just want to get some posts out into the internet this is not the way to do it.
Get over to medium or WordPress, or if you need some more flexibility then Gatsby looks like a great choice.

So all of this said I feel the need to justify my actions.

This blog wasn't just about the articles.
It was also about experimenting, and learning.
I wanted to learn TypeScript, so I needed an application to work on.
I got sick of the Redux store we use on my project letting everyone know when anything changes,
and experimented with some ideas, then found recoil,
but how does that work?
I was interested in what a Webpack plugin looked like, and how it works so I built one (it's very basic).

Right now I'm thinking a lot about Suspense API, Concurrent rendering and how it might solve some problems with my site.
Which leads me to wonder whether I could solve the problems without platform support, by implementing my own router.
So that might be my next project.

Personally I wouldn't want to do any of this in production code.
Imagine maintaining all that experimental taped together tech.
Sometimes a bit of experimentation and innovation is exactly what you need to drive a product forward.
But if you're just trying something out for curiosity...
Maybe not.
Doing things like writing your own state management system just to find out how one might work would be... unprofessional.
Don't try this at work folks.

So this _is_ a blog, but it's also a playground, maybe my secret lab.
I look forward to continuing to try out new ideas with it.
And who knows... maybe I'll even write down some opinions.
