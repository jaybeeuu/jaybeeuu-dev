# Over Engineered

This site is a little over engineered. OK... a lot over engineered.
If you want to see the code it's [here](https://github.com/jaybeeuu/jaybeeuu-dev).

It's a blog, but for some reason it's a preact application with a homegrown recoil like state management library.
It uses a custom webpack configuration, with a custom plugin for the RSS feeds.
The posts are built from markdown using a CLI wrapper around marked.js.
All of this is tested with jest driven unit tests and cypress e2e tests.
It's static assets are published with Cloudflare Pages.

That is a lot over engineered, and it's not how you should build a blog.
It's not performant (although lighthouse gives me a 98 so... [performance is relative](../premature-optimisation.md)).
There's too much code to maintain.
If you just want to get some posts out into the internet this is not the way to do it.
Get over to medium or fire up some cms, if you want to go down the static site route then Gatsby is a great choice.

SO what gives?
