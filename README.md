# Ember-audio

[![Github CI Workflow](https://github.com/sethbrasile/ember-audio/actions/workflows/ci.yml/badge.svg)](https://circleci.com/gh/sethbrasile/ember-audio)
[![codecov](https://codecov.io/gh/sethbrasile/ember-audio/branch/master/graph/badge.svg)](https://codecov.io/gh/sethbrasile/ember-audio) [![Code Climate](https://codeclimate.com/github/sethbrasile/ember-audio/badges/gpa.svg)](https://codeclimate.com/github/sethbrasile/ember-audio) [![Issue Count](https://codeclimate.com/github/sethbrasile/ember-audio/badges/issue_count.svg)](https://codeclimate.com/github/sethbrasile/ember-audio) [![Ember Observer Score](https://emberobserver.com/badges/ember-audio.svg)](http://emberobserver.com/addons/ember-audio) [![Greenkeeper badge](https://badges.greenkeeper.io/sethbrasile/ember-audio.svg)](https://greenkeeper.io/)

#### Installation
`ember install ember-audio`

#### [Interactive Demo/Documentation](http://sethbrasile.github.io/ember-audio)

Ember Audio provides an `audio` service and various classes/mixins that make
working with the Web Audio API super EZ.

Ember Audio aims to simplify sampling, triggering, routing, scheduling,
synthesizing, soundfonts, and working with audio in general.
___

#### Need your help!
Please give me feedback/suggestions if you have any. Pull requests and issues
are welcome. You can also contact me on the Ember community discord: `@sethbrasile`.

#### Using Ember Audio?
Please let me know if you're building something with Ember Audio! It's a fairly
large project, and I would love to know if it's working out for people! You can
contact me via `@sethbrasile` on the ember community discord, or via email.

#### Known Issues
- Ember optional feature `default-async-observers` creates a race condition which will interfere with `connections` being available when you need them. We need
  to remove the observer that triggers the `_wireConnections` method in order to resolve this. I tried a computed property in the past, but I didn't have enough
  control over when the computed property recalculated, so I stayed with an observer. I have some ideas on how to resolve, but this will probably not happen
  until I move this library to JS classes and remove the "classic classes."

Compatibility
------------------------------------------------------------------------------

* Ember.js v3.28 or above
* Ember CLI v3.8 or above

* `ember serve`
* Visit your app at http://localhost:4200/ember-audio/.


Roadmap
------------------------------------------------------------------------------
1. Get Ember Audio up to date so it doesn't create issues with new ember apps. The current goal is keeping compatibility all the way back to Ember 2.18 but no
   issues or deprecations in Ember 4+ - Don't know for certain this is possible, but that's the goal. If we need to bump compatibility to starting at Ember 3, I
   could deal with that.
2. Switch Ember Audio to 100% JS classes, no ember "classic classes" - but keep the mixins. Also don't know if this is possible, but this is my goal. I
   understand that "mixins are considered harmful" but rules like this don't apply to every scenario. I like the composability of combining mixins to create new
   playable/connectable types. Take a look at how `note`, `oscillator` and `sampled-note` are put together to see what I mean. I am open to suggestions if you
   have an idea on how to maintain this composability without mixins. I have a feeling decorators could do something similar, but I've not authored one of those
   yet so I'm uncertain.
3. Move Ember Audio to Typescript - This might interfere with the mixin concept also. IIRC Typescript doesn't like mixins..

### Building yuidoc Documentation

* `ember ember-cli-yuidoc`

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).
[Longer description of how to use the addon in apps.]


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
