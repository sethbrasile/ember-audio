import EmberRouter from '@ember/routing/router';
import config from 'dummy/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('soundfonts', function () {
    this.route('notes');
  });
  this.route('audio-files', function () {
    this.route('simple', { path: '/' });
    this.route('mp3-player');
    this.route('drum-kit');
  });
  this.route('audio-routing');
  this.route('timing', function () {
    this.route('drum-machine');
    this.route('with-ember-audio');
  });
  this.route('synthesis', function () {
    this.route('drum-kit');
    this.route('xy-pad');
  });
});
