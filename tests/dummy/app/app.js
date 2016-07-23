import Ember from 'ember';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

const {
  Application
} = Ember;

// window.AudioContext = window.AudioContext || window.webkitAudioContext;

if (!window.AudioContext) {
  document.write(`Oh poo. Looks like this browser doesn't support the Web Audio API.<br><br>`);
  document.write('<a href="http://caniuse.com/#feat=audio-api">See supported browsers.</a><br><br>');
  document.write('<a href="http://lmgtfy.com/?q=web+audio+api+audiocontext+polyfill">There are polyfills, but I have not tested them.</a>');
}

let App;

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
