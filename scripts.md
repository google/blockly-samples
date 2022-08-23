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
This script deletes `node_modules/` from each plugin in this repo.
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

### `npm run publish:prepare`
This script will clone a copy of blockly-samples to a directory called `dist`,
run `npm ci`, build and test all plugins, and then log in to the npm publishing
service. It must be run before any of the other manual publishing commands are
run.

If any plugin fails to build or some tests fail, this script should fail. Since
nothing has been pushed to npm or github, you can simply correct the error and
try again.

### `npm run publish:manual`
This script assumes that you have already run `npm run publish:prepare`. It will
publish all of the changed plugins since the last release, using the `dist` directory. It
runs the lerna command that uses conventional commits to determine a new version number
for each plugin, and publishes the new versions to npm and to a github release and tag.
Since all plugins should have the `prepublishOnly` lifecycle script configured, plugins
will build themselves before the publish step, so that the correct files are uploaded.

If any plugin fails to build, hopefully that should have been caught by the
`publish:prepare` script. If it fails during this step, then likely some plugins have
already been published to npm, and some will not have due to the error. That may also
occur if there is some other with npm while running this command. You can recover from
this state by fixing the error, and then running `npm run publish:prepare` again followed
by `npm run publish:unpublishedOnly` or `npm run publish:force`.

### `npm run publish:unpublishedOnly`
This script assumes that you have already run `npm run publish:prepare`. It uses the `dist`
directory created in that script. It uses lerna to check each plugin to see if the version
in `package.json` matches the version on npm. If a version is not yet on npm, it will publish
that plugin without updating its version number. Thus, this script should only be used
after `lerna version` has been run in some form (most commonly, during a run of
`npm run publish:manual` that subsequently failed).

If this script fails, correct the error and re-run `npm run publish:prepare` and
`npm run publish:unpublishedOnly`.

### `npm run publish:force`
This script assumes you have already run `npm run publish:prepare`. It will use lerna
to force publish all packages, even those that have not changed. You can use this
if you run into publishing problems to recover from error states, but you should prefer
to use `npm run publish:unpublishedOnly` if possible.

### `npm run publish:checkVersions`
This script assumes you have already run `npm run publish:prepare`. It will run `lerna
version` to generate the new version numbers using conventional commits that would be
created during a full publish action, but it will not actually push the changes nor
create any tags. This can be used to check which plugins would be published and under
what versions. Note to get accurate results with `lerna version` you must have the
latest tags pulled. This is taken care of by the `publish:prepare` script.

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
