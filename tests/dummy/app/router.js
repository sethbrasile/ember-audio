import Ember from 'ember';
import config from './config/environment';

const {
  Router: EmberRouter
} = Ember;

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('soundfonts', function() {
    this.route('notes');
  });
  this.route('audio-files', function() {
    this.route('simple', { path: '/' });
    this.route('mp3-player');
    this.route('mp3-player-code');
    this.route('drum-kit');
  });
  this.route('audio-routing');
  this.route('timing', function() {
    this.route('drum-machine');
    this.route('with-ember-audio');
  });
  this.route('synthesis', function() {
    this.route('drum-machine');
  });
});

export default Router;
