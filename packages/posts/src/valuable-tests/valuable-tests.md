# Valuable Tests

I think we can all agree that writing tests is a good idea.
Tests prove your code works.
As part of your CI pipeline, they prove your code continues to work.
They help others to change your code with confidence.
Tests help describe what you meant, even when the code is complex.

The problem with tests, the fly in the ointment, the salt on the pudding is that they get in the way.
Don't they?
Ever made a tiny change or refactor,
pushed it up,
asked for review only to find out a cascade of tests failed or needed updating?
Ever tried changing a test only to discover the setup is so complicated,
or interleaved with other tests that it's impossible to figure out or the change grows indefinitely?
Run a CI pipeline only for it to spend half an hour running a single test?

Tests at their best are a vital tool to the professional,
at their worst,
a hindrance,
a scourge on the land.

Invaluable,
or worse than valueless.

All tests no matter how well written will have a cost to them.
At the very least there's the time and energy in your build pipeline to run them.
But there's also effort used up to maintain them,
update them,
understand them,
etc.

So how do you decide whether your test is worthwhile?

## Weight vs. Value

I think of it as Weight vs. Value.
Does the test bring enough value that it's weight is made worth while?

If you think of a project as like a heist.
(I'm going to try not to carry this analogy to far...)
There's only so much you can carry on your getaway so what do you want to steal?

It's obvious that a diamond is worth stuffing in your pocket
(so long as your pockets definitely don't have holes), valuable and light.
A gold bar... maybe.
Very valuable, but also very heavy so you probably can't carry too many of them.
A sack full of pennies? Probably not.

Applying that to your tests,
there are some tests that are obviously worth carrying,
they take little or no setup,
they are simple to write,
simple to read and take barely any time to run.
For example, tests exercising functional code can often fall into this category,
the ins and outs are all you need,
there's no pesky side effects or secondary data sources to setup.
Definitely worthwhile.
Other tests might be more complicated,
but test a core bit of delicate legacy functionality.
The kind of code that is hard to change,
easy to break,
and that might not be obvious when it is,
but also vital to the use of your system.
You can't say no to a gold bar.
Bring 'em along (but not too many).

Those delicate,
flaky,
ponderously slow tests tests that you spend hours preening,
pampering and coaxing to pass,
and only cover 50% of code you are actively replacing and never make changes to?
No one likes to hang a sack of pennies round their neck on a marathon.

## Where is the Value?

Hopefully the Weight of a test is an easy thing to grasp.
If not exactly measurable you should have a feel for what I'm getting at.
We deal with weight every day,
in all aspects of our coding life.
It's the friction (and there is always some) of what has gone before,
or the heat coming off our CPUs.

Value, at least in the context of tests, I think is harder to define.
After all tests by their nature are more abstract than production code.
More Meta.

Production code has a clear value to the end user.
Remove something and some feature goes offline.
The user can't do something or can't see something.
If that's not the case then, well done, removing it was the right thing to do.

But remove a test and (assuming your team mates approve the PR) what happens?

Probably nothing.
Your PO doesn't pace behind your chair until you put it back.
Emails are not sent to increasingly senior people on the project.
You will probably have time for lunch and make it home before midnight.

The value of tests comes over time,
and even then the value is most often in things that don't happen.
Bugs that *don't* show up,
time *not* spent understanding what the intended outcome of some twisty logic.
They need to be thought of as an investment.
THey will pay dividends.

Of course justifying time spent doing something that prevented something happening is hard.
You need to have the counter example in order to prove it,
so it ends up needing to be taken on faith.
Add to that a dev team complaining about unit tests that fail or E2E tests that flake out,
spending large amounts of time writing and maintaining test suites instead of writing features
or simply upping every estimate in order to allow time to write the tests...
You can see why some people around the project wonder what they are buying.

So in order to do the professional thing and make sure our code is tested properly,
we must make sure that the value is greater than the weight of *every* test.

## Trim the Fat

OK so if you've gotten this far then you've waded through my dreadful analogy for long enough to deserve a reward.
Hopefully the big question on your lips is "How to I get Value without the Weight?"

Well it's impossible. Every test takes some time to write, some time to run and maintain.
So there's always some weight.
That's how physics works in this universe.
Sorry.
There's no getting around it,
but at least we can do better than the sack o' pennies.

1. Run them.

   Run unit tests locally during development,
   with a watch if you can.
   Run them in CI,
   gate merges on passing unit tests and run slower tests as frequently as you can.
   If they are in your mind then the maintenance will follow.

2. Prevent changes to behaviour, not code.

   There are two things that should cause changes to a test.
   Changes to the API and changes to the behaviour.
   Anything else and they should stay green unless you broke the code.
   That means using test patterns which test the *behaviour* not the *implementation*.

3. Keep them passing.

   **Pay attention**, keep them passing, squash flake.
   As soon as they start failing or flaking they lose value and grow heavier.

4. Treat test code like prod code.

   Make it readable, refactor it, treat it like you want it there.
   All the things we do to keep prod code maintainable and ensure it stands the test of time,
   our tests deserve that too.
   There are some things that differ.
   Test code can be WETter for example,
   since there is a level of DRYness which can hinder the documentation aspect of the tests.
   But on the whole apply all your good habits to test code just as you do to production code.

I'm not perfect. At the time of writing I don't pretend that I follow strict TDD,
(Although in the course of writing this post I found
[this](https://www.computer.org/csdl/magazine/so/2007/03/s3024/13rRUygT7kK)
summary of research on the subject... which makes me think I should tighten up and take another look.)
and I understand the pressures of a project as much as the next person.
But the code I ship is always tested in some way,
and I make every effort to ensure that it is done such that keeps the value high and he weight down.
The points listed above are a distillation of how I think it through.
I hope you find them useful too.
