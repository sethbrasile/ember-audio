# Ember-audio

[![Build Status](https://travis-ci.org/sethbrasile/ember-audio.svg?branch=master)](https://travis-ci.org/sethbrasile/ember-audio) [![Code Climate](https://codeclimate.com/github/sethbrasile/ember-audio/badges/gpa.svg)](https://codeclimate.com/github/sethbrasile/ember-audio) [![Test Coverage](https://codeclimate.com/github/sethbrasile/ember-audio/badges/coverage.svg)](https://codeclimate.com/github/sethbrasile/ember-audio/coverage) [![Dependencies](https://david-dm.org/sethbrasile/ember-audio.svg)](https://david-dm.org/sethbrasile/ember-audio) [![Ember Observer Score](http://emberobserver.com/badges/ember-audio.svg)](http://emberobserver.com/addons/ember-audio) [![Issue Count](https://codeclimate.com/github/sethbrasile/ember-audio/badges/issue_count.svg)](https://codeclimate.com/github/sethbrasile/ember-audio)

Ember-audio provides an `audio` service that makes working with the Web
Audio API super EZ.

This is not done and not released yet! It does however, work. Feel free to take
a look at the code (there are inline docs) and the dummy app if you want to try
it out.

**Note**: You must be using a modern browser: http://caniuse.com/#feat=audio-api

Still needs:

- demo app / docs
- a way to add effects. "pan" currently exists, but I would love to add more and add support for:
  - "plugging in" custom effects
  - customizing audio routing.


## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `npm test` (Runs `ember try:testall` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).
