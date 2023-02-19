import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'dummy/config/environment';

if (!window.AudioContext && !window.webkitAudioContext) {
  document.write(
    "Oh poo. Looks like this browser doesn't support the Web Audio API.<br><br>" +
      '<a href="http://caniuse.com/#feat=audio-api">See supported browsers.</a><br><br>' +
      '<a href="http://lmgtfy.com/?q=web+audio+api+audiocontext+polyfill">There are polyfills, but I have not tested them.</a>'
  );
}

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
