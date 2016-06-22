import Ember from 'ember';

export default function getPositionFor(path) {
  return Ember.computed(path, function() {
    const name = this.get(path) || path;
    const posPath = `audio.sounds.${name}.position`;
    const position = this.get(posPath);
    const trigger = () => this.notifyPropertyChange('position');

    if (!position) {
      this.addObserver(posPath, trigger);
    }

    return position;
  });
}
