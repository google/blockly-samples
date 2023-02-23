# blockly-samples gh-pages site


## Serving Locally

### Setup

Install Ruby

Install bundler:

```bash
gem install jekyll bundler
```

From the gh-pages directory, run:

```
bundle install
```

### Install and build blockly-samples

From the root directory, run:

```
npm install
cd examples && npm install
cd ..
# This copies necessary files to gh-pages folder. This is necessary to run gh-pages locally.
npm run deploy:prepare
```

This runs `install` for all of the plugins and all of the examples, then runs the `deploy:prepare` script to copy over built files into the gh-pages directory.

### Test locally with beta

From the root directory run:

```
npm install
cd examples && npm install
cd ..
# This copies necessary files to gh-pages folder. This is necessary to run gh-pages locally.
npm run test:ghpages
```

This runs `install` for all of the plugins and all of the examples, then directly installs the current beta release of Blockly, then runs the `deploy:prepare` script to copy over built files into the gh-pages directory.

### Serve

From the gh-pages directory, start the jekyll server by running:

```
bundle exec jekyll serve
```

Jekyll will watch files and regenerate on changes, except if you change
_config.yml, at which point you will need to restart the server.


Browse to http://127.0.0.1:4000

## Deploying

### One-click

Run the [Update GitHub Pages Action](https://github.com/google/blockly-samples/actions/workflows/update_gh_pages.yml) from either the `google/blockly-samples` repo or your fork to deploy to that location automatically. Click the "Run workflow" button to start it. After this workflow finishes, GitHub's built-in "build and deploy" action will automatically start. When that finishes, the updated site will be live.

Note: Updating GitHub Pages is done automatically when publishing plugins through the Publish action.

### Manual

1. Make sure everything is installed (plugins and examples). From root, run:

    ```
    npm install
    cd examples && npm install
    cd ..
    ```

2. Build and push

    * to your personal gh-pages site:

        ```
        npm run deploy
        ```

        Test at `<your username>.github.io/blockly-samples/`.


    * to the blockly-samples gh-pages site:

        ```
        npm run deploy:upstream
        ```

        Test at https://google.github.io/blockly-samples/
