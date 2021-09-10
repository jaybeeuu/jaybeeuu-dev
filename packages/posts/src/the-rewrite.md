# The Rewrite

My advice is always not to rewrite your application all in one go.

If you do that every time you add or change a technology they your productivity will tank. We have something like 100,000
lines of code in our app and have just decided to start using TypeScript - imagine how long it would take if we tried
to rewrite the whole thing in one go.

There's also a lot of risk in changing things over. Each time you develop a feature you spend a lot of time testing it.
If you change something about it then you should repeat those tests otherwise you have unproven software i.e. there
will be bugs (trust me there will be) that you are releasing to your users. Buggy software makes for unhappy users,
PO's and stakeholders. So keep your quality bar high and retest things when you change something. If you rewrite every
feature in your app that means retesting everything in your app.

Worse if you rewrite the whole thing and then decide the naming convention you used isn't suitable or the way you
organised the files doesn't suit you then you rewrite the whole thing again.... and test it again...
and rewrite it again... and test it again... You get the point - Unprofessional.

A much better approach is to agree an approach with the whole team. Choose a target feature where you will prove the
case, try out the structure etc. Then get it in. Once you've done that iterate on it if you need/learnt something
new - oh this naming convention isn't any good - let's call things this instead, oh hang on we actually need these
components/classes/what have you to be exposed for this reason - let's do that...

Once you have done that start applying it to every new feature you write - the rest is tech debt, i.e. you borrowed some
time you will have to pay back at some point.

It is your choice  how you deal with tech debt. Generally speaking it is better to tackle it as quickly as you can.
But as quick as you can has different definitions depending on the project. In some projects where time,
money and people are infinite you could probably set to and just bosh it out. however - that is never the case.
your PO will still want features developed. So the grand rewrite is impossible. Instead aim for the more pragmatic approach:

1. Be A Good Scout - leave things tidier than you found it. So anything you touch during your stories should move to
Redux if it's relevant and doesn't take too long to do. If it would slow you down too much then make a story.
(This applies to everything in your coding life, from unit tests, to refactoring to documentation.
You should aim to increase value every time you touch a codebase. and a well maintained, tidy, codebase has more
value than the other kind.)
2. Pull stories in when you have time. This is where keeping your PO happy comes in. Generally they don't care about
technical details and are feature/user focussed. So you will have to make your case about why you are doing it,
ensure buy in and then keep it efficient and keep delivering. If they still get the features they need then they will
stay happy for you to keep pulling stuff in that seems irrelevant. If you can demonstrate that it is speeding up the
feature dev then even better.
