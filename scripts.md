# blockly-samples

## Available Scripts

In this directory, you can run:

### `npm run audit:fix`
This script runs `npm audit fix` on each of the Blockly plugins in this repo.

### `npm run boot`
This script runs `lerna bootstrap` which will run `npm install` in each plugin
and ensure local plugins are symlinked, ready for development.
When developing a plugin, always run `npm run boot` instead of `npm install`
directly, as this ensures local plugins (eg: dev-tools) are locally linked.

### `npm run build`
This script builds all of the Blockly plugins in this repo.

### `npm run clean`
This script runs `npm run clean` on each of the Blockly plugins.
In general, clean deletes the `/build` and `/dist` folders in these plugins.

### `npm run clean:node`
This script recursively deletes all `node_modules/` directories in this repo.
This may be useful if you feel your node modules have wound up in a bad state.

### `npm run deploy`
This script packages each of the plugins's test playgrounds and deploys them to
gh-pages. You can browse these plugin playgrounds at:
https://YOURUSERNAME.github.io/blockly-samples/.

### `npm run deploy:upstream`
This script is similar to `npm run deploy` but it deploys the plugins to
`blockly-samples` upstream. You can browse these plugin playgrounds at:
https://google.github.io/blockly-samples/.

### `npm run license`
This script runs the `js-green-licenses` checker on all of the Blockly plugins.
Run this script before release to make sure none of our plugin dependencies
use packages with non-green licenses.

### `npm run lint`
This script runs `npm run lint` on each of the Blockly plugins in this repo.

### `npm run lint:fix`
This script runs lint with the `--fix` option on each of the Blockly plugins in
this repo.

### `npm run test`
This script runs `npm run test` on each of the Blockly plugins in this repo.

### `npm run publish`
This script runs the publish script that publishes any changed plugins to npm.
The script first makes sure you're logged into the npm registry used for
publishing. It then checks out a clean blockly-samples repo under `/dist` and
prepares it for publishing. Finally, it runs `lerna publish` that walks you
through the publishing process.

Before you run this, it's a good idea to run `npm run publish:check` and
`npm run publish:dryrun`.

### `npm run publish:check`
This script runs `lerna changes` that checks whether or not any of the plugins
have changed since last published, and thus require publishing.

### `npm run publish:dryrun`
This script runs the publishing script, but with a dryrun flag, such that
nothing is actually published to npm.

## Other Scripts

### `npm run postinstall`
This script runs `npm run boot` after install. This makes sure that `boot` is
called after `npm install` is run.

There shouldn't be a need for you to run this script directly.

### `npm run deploy:prepare`
This script prepares each of the plugins for deployment. In general, the script
cleans and builds the src and test directories of each plugin.

You shouldn't need to run this script directly, instead it is run by
`npm run deploy` and `npm run deploy:upstream`.

### `npm run publish:_internal`
This script is called by the `npm run publish` script above to call lerna.
There shouldn't be a need for you to call this script directly.
