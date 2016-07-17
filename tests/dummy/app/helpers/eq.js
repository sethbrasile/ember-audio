import Ember from 'ember';

const {
  Helper
} = Ember;

export function eq(params) {
  return params[0] === params[1];
}

export default Helper.helper(eq);
