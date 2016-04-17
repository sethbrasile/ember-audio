import Ember from 'ember';

export default function request(src, type='arraybuffer') {
  return new Ember.RSVP.Promise((resolve, reject) => {
    const req = new XMLHttpRequest();

    req.open('GET', src, true);
    req.responseType = type;

    req.onload = function reqOnload() {
      const response = req.response;

      if (response) {
        resolve(response);
      } else {
        reject(`Could not load audio data from ${src}`);
      }
    };

    req.send();
  });
}
