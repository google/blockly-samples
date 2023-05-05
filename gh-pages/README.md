# blockly-samples gh-pages site


## Serving Locally
To test locally, go to the root of blockly-samples and run:

    ```
    npm run test:ghpages
    ```


To test locally with a beta version of Blockly, go to the root of blockly-samples and run:

    ```
    npm run test:ghpages:beta
    ```

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
