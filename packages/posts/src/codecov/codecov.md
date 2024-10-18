# Switching on Codecov

Code coverage is one of those marmite topics.
Some people really want it, and others think it's a waste of time, or worse that coverage targets are toxic and dangerous.

I decided a little while ago to try paying attention to coverage stats in this code base. I was pleasantly surprised at the insight it brought me and the way it changed how I thought about the tests I was writing.

## Some background

I've always been on the "I don't like it" side the argument.

It seems to me that if you're following TDD or similar workflows, i.e. testing is an intrinsic part of the way you build software, then you don't need a coverage target, you're not aiming to fill in the missing blanks, and you don't need to see what's not covered since you already wrote your tests for the behaviour you want before, or during development... you can't have any blanks.

I've also seen and heard of some horror stories.

In one team I've worked in there was honestly an argument about whether or not it was worth deleting some dead code. It was better covered with unit tests than the rest of the codebase, so it was propping up the stats, and the deletion couldn't be committed without adding unit tests, or reducing the limits.
So... should we just not bother?.... !

In another team I heard about, they had exactly one unit test, and kept the coverage target happy by adding lines to the single (useless) function that it covered until they could commit their changes.

Coverage limits and targets are no substitute for good engineering practices.
If testing is an intrinsic part of your workflow, in whatever form, TTD or BDD or another style, you'll find that you get high coverage without checking the stats.

It's also clear to me that without the right culture and buy in from engineers, code coverage checks will be worked around, or hinder other efforts to improve things.

On the other hand, it's hard to argue against coverage targets and reports.
The idea of having and enforcing a high level of test coverage is, after all, very appealing.
And have you ever tried to frame an argument for removing the requirement to have high test coverage?

So in the name of experimentation, I gave
[codecov](https://about.codecov.io/)
a try.
You can see
[my repos coverage here](https://app.codecov.io/gh/jaybeeuu/jaybeeuu-dev).

## Codecov

I'm not really interested in reviewing codecov, this is really a post about the general idea of measuring coverage. but...

I chose codecov largely because it's free for open source repos, and it's _the_ name in this space that I could think of, and I can see why.

It has some really good visualisations and allows you to explore the coverage, right down to the source file.
Integrating it into the CI/CD tool I use, circle-ci, was
[really easy](https://circleci.com/docs/code-coverage/#codecov).
You can look at coverage per branch or PR too and track how coverage is changing over time.

If you're looking for a tool for this then I'd at least consider it in a shortlist.

Enough on that subject. What did all of this do for me?

## So what?

I think having this tool did a couple of things for me that I found surprising.

- It told me that I was (almost) right about not needing to measure if you have good practice.
- It showed me where I _had_ missed some cases.
- It encouraged me to fill in the blanks.
- It showed me some dead code.

When I first turned it on my coverage was
[81%](https://app.codecov.io/gh/jaybeeuu/jaybeeuu-dev/pull/131/tree).
I don't think that's too bad, and pretty close to the target 80% that some recommend.
It's worth pointing out too that I only enabled codecov for the unit tests in my repo.
For the site I'd chosen to take an E2E first approach, so actual coverage was slightly higher (turned out to be around
[4% higher](https://app.codecov.io/gh/jaybeeuu/jaybeeuu-dev/pull/183)).

Personally I think this partially validated my instinct that if you have (dusts shoulders) a good approach to testing and consider it part of your engineering workflow then you can survive without it.

I think I might be abnormally into writing unit tests though; starting as a QA has given me a certain perspective.
I've certainly worked with some engineers who are, in many other ways extremely talented and dedicated, but who _never_ write a test unless they had their arms twisted.
So while having a test focus does result in coverage being slightly unnecessary, enforcing the discipline in others might be just what your team needs.

The next insight I'm not perfect (Surprise!).
So in exploring the visualisations I also discovered that I'd missed some things, and that in some cases they were definitely twisty bits of logic that needed covering with tests.
I also found that, measuring, and publicising my coverage was a huge motivator for filling in the blanks.
I've added around 10% coverage over a few commits, and it was kind of fun seeing that doughnut turn steadily green.

Interestingly it went the other way too.
I found that despite covering all the behaviours I wanted, there was still some code which was not covered. It turned out it was dead code, which could be deleted.

It occurred to me that this is a valuable insight.
I would have had no reason to explore that code, and even had I stumbled upon it, I would have needed to spend some time analysing call paths etc to confirm it was unused,

## Would I do it again?

I think on balance I would still be cautious of enforced limits. But I might apply them to teams where test coverage was low, and the culture needed adjusting.
Especially I'd look at "patch coverage" (the amount of coverage there is of the changed lines) rather than project coverage.
When there is already a culture of testing, I think there is still value in measuring and visualising the coverage of your test suite, so personally I think a tool like this would be worthwhile.
