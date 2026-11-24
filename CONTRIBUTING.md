# How To Contribute

## Installation

* `git clone <repository-url>`
* `cd my-addon`
* `npm install`

## Linting

* `npm run lint:hbs`
* `npm run lint:js`
* `npm run lint:js -- --fix`

## Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `scripts/test-ember.sh 3.16` – Runs the test suite on another Ember version (2.18 through 3.24), with sync and then async observers
* `scripts/test-consumer.sh 6.4 6.12` – Packs the addon, installs it into a new Ember CLI 6.4 app with Ember 6.12, and runs the test suite there. This is how Ember 3.28 and later are tested

This branch builds with Ember CLI 3.8, so `ember test` and `scripts/test-ember.sh` need Node 6 through 16. `scripts/test-consumer.sh` needs Node 18 or later. CI runs both on every pull request to `v1`.

## Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).