import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('soundfonts', function() {
    this.route('play', { path: '/' });
    this.route('code');
    this.route('notes');
  });
  this.route('audio-files');
});

export default Router;
