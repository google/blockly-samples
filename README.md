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

```
npm install
cd examples && npm install
cd ..
npm run deploy:prepare
```

This runs `install` for all of the plugins and all of the examples, then runs the `deploy:prepare` script to copy over built files into the gh-pages directory. 

### Serve

From the gh-pages directory, start the jekyll server by running:

```
bundle exec jekyll serve
```

Jekyll will watch files and regenerate on changes, except if you change
_config.yml, at which point you will need to restart the server.


Browse to http://127.0.0.1:4000

## Deploying

### To personal gh-pages

Make sure everything is installed (plugins and examples). From root, run:

```
npm install
cd examples && npm install
cd ..
```

Build and push to your personal gh-pages site:

```
npm run deploy
```

Test at `<your username>.github.io/blockly-samples/`.

## To blockly-samples gh-pages

```
npm install
cd examples && npm install
cd ..
```

Build and push to the blockly-samples gh-pages site

```
npm run deploy:upstream
```

Test at https://google.github.io/blockly-samples/
