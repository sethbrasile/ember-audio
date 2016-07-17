import Ember from 'ember';

const {
  Helper
} = Ember;

export function undasherize(params) {
  return params[0].split('-').join(' ');
}

export default Helper.helper(undasherize);
