# blockly-samples

## Available Scripts

In this directory, you can run:

### `npm run deploy`

This script packages each of the examples and plugins from the core repository and deploys them to
gh-pages. You can browse these plugin playgrounds at:
https://YOURUSERNAME.github.io/blockly-samples/.

### `npm run deploy:upstream`

This script is similar to `npm run deploy` but it deploys the examples and plugins from the core repository to
`blockly-samples` upstream. You can browse these playgrounds at:
https://raspberrypifoundation.github.io/blockly-samples/.

### `npm run lint`

This script runs `npm run lint` on each of the Blockly examples in this repo.

### `npm run lint:fix`

This script runs lint with the `--fix` option on each of the Blockly examples in
this repo.

### `npm run test:ghpages`

This script builds all files needed to deploy plugins and examples to GitHub Pages, then starts a local server with that content.

### `npm run test:ghpages:beta`

This script installs a beta version of Blockly, builds all files needed to deploy plugins and examples to GitHub Pages, then starts a local server with that content.

## Other Scripts

### `npm run deploy:prepare`

This script prepares each of the examples for deployment.

You shouldn't need to run this script directly, instead it is run by
`npm run deploy` and `npm run deploy:upstream`.

### `npm run prepare-examples`

Run this script to copy the entire contents of the installed
`blockly` package and to copy each local `@blockly/*` plugin's
`dist/` output (if present) into `examples/lib/` so example test
pages can reference those packages. This is run automatically
before deploying to GitHub Pages. To view an example test page on
your file system, run this command manually first.
