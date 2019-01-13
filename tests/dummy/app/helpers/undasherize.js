import Helper from '@ember/component/helper';

export function undasherize(params) {
  return params[0].split('-').join(' ');
}

export default Helper.helper(undasherize);
