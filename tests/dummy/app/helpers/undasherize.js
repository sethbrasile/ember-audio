import { helper } from '@ember/component/helper';

function undasherize([input]) {
  return input.split('-').join(' ');
}

export default helper(undasherize);
