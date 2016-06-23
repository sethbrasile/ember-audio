import Ember from 'ember';

function getComputed(type, path, prop, cb) {
  return Ember.computed(path, function() {
    const name = this.get(path) || path;
    const propPath = `audio.${type}.${name}.${prop}`;
    const property = this.get(propPath);
    const observer = () => this.notifyPropertyChange(prop);

    if (!property) {
      this.addObserver(propPath, observer);
    }

    if (cb) {
      return cb(property);
    } else {
      return property;
    }
  });
}

export default function getProp(prop) {
  return {
    fromTrack(path, cb) {
      return getComputed('tracks', path, prop, cb);
    },
    fromSound(path, cb) {
      return getComputed('sounds', path, prop, cb);
    }
  };
}
