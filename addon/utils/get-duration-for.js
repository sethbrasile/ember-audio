import Ember from 'ember';

export default function getDurationFor(path) {
  return Ember.computed(path, function() {
    const name = this.get(path) || path;
    const durPath = `audio.sounds.${name}.duration`;
    const duration = this.get(durPath);
    const trigger = () => this.notifyPropertyChange('duration');

    if (!duration) {
      this.addObserver(durPath, trigger);
    } else {
      this.removeObserver(durPath, trigger);
    }

    return duration;
  });
}
