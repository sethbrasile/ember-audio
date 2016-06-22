import Ember from 'ember';

export default function getProp(prop) {
  return {
    fromSound(path, cb) {
      return Ember.computed(path, function() {
        const name = this.get(path) || path;
        const propPath = `audio.sounds.${name}.${prop}`;
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
  };
}
