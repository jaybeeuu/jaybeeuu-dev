# API Repo MGMT

## Nodegit

Use nodegit to manage git.

https://www.nodegit.org/

## Testing

Scenario testing to API level with packaged git repos - will need to create framework for loading files into "remote repo" dir (posible to do only in memory?) and then using nodegit to clone/update etc.

### Framework

* Declaratively create git repos from the tests. see `packages/api/test/git.ts`.

## Init/refresh

* Should this be during startup phase of API? Or just on API endpoint call? I think i'm going to only do it on endpoint call.
* Detect if repo already exists (error recovery)

* If local does not exist
   * clone
* Else
  * pull
* Compare current and previous commits - git diff
* build new/updated files to post json
* Update manifest
* Store new commit ref - persist.

Do this transactionally?

This is also the behaviour for refresh.

Could initially skip the diff and just rebuild everything.

### Markdown Parsing

* [marked](https://marked.js.org/)
* [@types/marked](https://www.npmjs.com/package/@types/marked)
* [DOMPurify](https://www.npmjs.com/package/dompurify)
* [highlight.js](https://highlightjs.org/)

### Post JSON struncture

```json
{
  "title": "string",
  "date": "string",
  "html": "string"
}
```
Save File to hash.

### Manifest JSON structure

```json
[
  {
    "title": "string",
    "date": "string",
    "address": "string"
  }
]
```