# Close old draft PRs

Closes draft PRs that have had no activity for a specified amount of time. Can also leave an optional
`closing-comment` if you'd like.

### Building and testing

Install the dependencies

```bash
$ yarn install
```

Build the typescript and package it for distribution

```bash
$ yarn run build && yarn run pack
```

Run the tests (coming soon):heavy_check_mark:

```bash
$ yarn run test
```

### Usage

Basic:

```yaml
name: Draft PR Closer
on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  close_drafts:
    runs-on: ubuntu-latest
    name: Draft PR Closer
    steps:
      - name: Get PR Status
        uses: treiff/draft-pr-closer@v0.2-alpha
        with:
          repo-token: '${{ secrets.GITHUB_TOKEN }}'
          days-before-close: 2
          closing-comment: 'Looks like this has been around a while, going to close'
```

### Debugging

To see debug output from this action, you must set the secret `ACTIONS_STEP_DEBUG` to `true` in your repository. You can run this action in debug only mode (no actions will be taken on your issues) by passing `debug-only` `true` as an argument to the action.
