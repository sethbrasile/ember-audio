# Ember-audio

[![Build Status](https://travis-ci.org/sethbrasile/ember-audio.svg?branch=master)](https://travis-ci.org/sethbrasile/ember-audio) [![Dependencies](https://david-dm.org/sethbrasile/ember-audio.svg)](https://david-dm.org/sethbrasile/ember-audio) [![Code Climate](https://codeclimate.com/github/sethbrasile/ember-audio/badges/gpa.svg)](https://codeclimate.com/github/sethbrasile/ember-audio) [![Issue Count](https://codeclimate.com/github/sethbrasile/ember-audio/badges/issue_count.svg)](https://codeclimate.com/github/sethbrasile/ember-audio) [![Ember Observer Score](http://emberobserver.com/badges/ember-audio.svg)](http://emberobserver.com/addons/ember-audio) [![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QDPUK852HN9U2)

#### Installation
`ember install ember-audio`

#### [Interactive Demo/Documentation](http://sethbrasile.github.io/ember-audio)

Ember Audio provides an `audio` service and various classes/mixins that make
working with the Web Audio API super EZ.

Ember Audio aims to simplify sampling, triggering, routing, scheduling,
synthesizing, soundfonts, and working with audio in-general.

#### Buy me a Beer!
With the paypal donation link above^ :D
___

**Note**: Ember Audio will probably not fully respect semver until it is out of
alpha!

**Note**: Target browsers must be modern! The list of supported browsers at
the moment is pretty small. Please check http://caniuse.com/#feat=audio-api.
Also note that Safari claims compatibility with a prefix, but it's not really
compatible, as it's implementation of `AudioContext` does not meet current
specifications. You *may* be able to make it work with a polyfill. I have not
tested this.

#### Need your help!
Ember Audio is currently in `alpha` and I'm still feeling out how the API for
this would be best designed, so please give me feedback/suggestions if you have
any. Pull requests and issues are welcome. You can also contact me on the Ember
community discord: `@sethbrasile`.

#### Using Ember Audio?
Please let me know if you're building something with Ember Audio! It's a fairly
large project, and I would love to know if it's working out for people! You can
contact me via `@sethbrasile` on the ember community slack, or via email.


Compatibility
------------------------------------------------------------------------------

* Ember.js v2.18 or above
* Ember CLI v2.13 or above

* `ember serve`
* Visit your app at http://localhost:4200/ember-audio/.


Usage
------------------------------------------------------------------------------

## Building yuidoc Documentation

* `ember ember-cli-yuidoc`

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).
[Longer description of how to use the addon in apps.]


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
