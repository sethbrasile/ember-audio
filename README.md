# Ember-audio

[![Github CI Workflow](https://github.com/sethbrasile/ember-audio/actions/workflows/ci.yml/badge.svg)](https://github.com/sethbrasile/ember-audio/actions)
[![codecov](https://codecov.io/gh/sethbrasile/ember-audio/branch/master/graph/badge.svg?token=9wJSHppYJf)](https://codecov.io/gh/sethbrasile/ember-audio)
[![Code Climate](https://codeclimate.com/github/sethbrasile/ember-audio/badges/gpa.svg)](https://codeclimate.com/github/sethbrasile/ember-audio)
[![Issue Count](https://codeclimate.com/github/sethbrasile/ember-audio/badges/issue_count.svg)](https://codeclimate.com/github/sethbrasile/ember-audio)
[![Ember Observer Score](https://emberobserver.com/badges/ember-audio.svg)](http://emberobserver.com/addons/ember-audio)

## Please Note

This readme refers to current the state of the master branch, which is a WIP. Please see the
[Interactive Demo/Documentation](http://sethbrasile.github.io/ember-audio) and [npmjs](https://www.npmjs.com/package/ember-audio) to see the readme and
documentation as of the current release.

## Installation

`ember install ember-audio`

## [Interactive Demo/Documentation](http://sethbrasile.github.io/ember-audio)

Ember Audio provides an `audio` service and various classes/mixins that make
working with the Web Audio API super EZ.

Ember Audio aims to simplify sampling, triggering, routing, scheduling,
synthesizing, soundfonts, and working with audio in general.

---

## Need your help!

Please give me feedback/suggestions if you have any. Pull requests and issues
are welcome. You can also contact me on the Ember community discord: `@sethbrasile`.

## Using Ember Audio?

Please let me know if you're building something with Ember Audio! It's a fairly
large project, and I would love to know if it's working out for people! You can
contact me via `@sethbrasile` on the ember community discord, or via email.

## Known Issues

- Ember optional feature `default-async-observers` creates a race condition which will interfere with `connections` being available when you need them. We need
  to remove the observer that triggers the `_wireConnections` method in order to resolve this. I tried a computed property in the past, but I didn't have enough
  control over when the computed property recalculated, so I stayed with an observer. I have some ideas on how to resolve, but this will probably not happen
  until I move this library to JS classes and remove the "classic classes."

## Compatibility

- Ember.js v3.28 or above
- Ember CLI v3.8 or above

## Run The Demo locally

- `ember serve`
- Visit http://localhost:4200/ember-audio/.

## Roadmap

1. ~~Get up to date so it doesn't create issues with new ember apps. The current goal is keeping compatibility all the way back to Ember 3.28 but no
   issues or deprecations in Ember 4+~~ - Done
2. Do some cleanup and testing and ensure compatibility, assess for breaking changes, then cut a new release.
3. Switch to 100% JS classes, no ember "classic classes" - but I haven't decided on a strategy for the mixins yet. I like the composability of
   combining mixins to create new playable/connectable types. Take a look at how most of the classes are built, and take a look at
   [MusicallyAwareOscillator](https://sethbrasile.github.io/ember-audio/#/synthesis) to see what I mean. I am open to suggestions if you have an idea on how
   to maintain this composability without mixins. I have a feeling decorators could do something similar, but I've not authored one of those yet and I see
   similar warnings about them compared to mixins so I'm uncertain.
4. Cut a 2.0 release (`.get` api will be broken for instance)
5. Move Ember Audio to Typescript - This might interfere with the mixin concept also. IIRC Typescript doesn't like mixins.. At least provide TS definitions.
6. Extract most of the important code into a non-ember project and reference that as a dependency here.

## Building yuidoc Documentation

- `ember ember-cli-yuidoc`

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).
[Longer description of how to use the addon in apps.]

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
