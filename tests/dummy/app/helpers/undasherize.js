import Ember from 'ember';

export function undasherize(params) {
  return params[0].split('-').join(' ');
}

export default Ember.Helper.helper(undasherize);
