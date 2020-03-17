# API Repo MGMT

## Nodegit

Use nodegit to manage git.

https://www.nodegit.org/

## Testing

Scenario testing to API level with packaged git repos - will need to create framework for loading files into "remote repo" dir (posible to do only in memory?) and then using nodegit to clone/update etc.

### Framework

* Dir containing remote repo, local repo, built html(?)
* Test setup
  * Replace local repo dir
  * Replace remote repo
  * Replace local built HTML.

Involves storing a bunch of files including simple git repos in bickleywallace-site. Problem? ZIP?

## Init/refresh

* Should this be during startup phase of API? Or just on API endpoint call? I think i'm going to only do it on endpoint call.
* Detect if repo already exists (error recovery)

* If local does not exist
   * clone
* Else
  * pull
* Compare current and previous commits - git diff
* build new/updated files to HTML
* Update manifest
* Store new commit ref - persist.

Do this transactionally?

This is also the behaviour for refresh.

Could initially skip the diff and just rebuild everything.
