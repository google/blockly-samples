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

### Serve

From the gh-pages directory, start the jekyll server by running:

```
bundle exec jekyll serve
```

Jekyll will watch files and regenerate on changes, except if you change
_config.yml, at which point you will need to restart the server.


Browse to http://127.0.0.1:4000
