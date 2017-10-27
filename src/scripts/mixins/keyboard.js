import { __, always, defaultTo, ifElse, equals, prop } from 'ramda';
import NavigationList from 'roving-tabindex-element-list';


/**
 * @type {object.<string, NavigationList>}
 */
const navigationLists = {};

/**
 * Gets the key from the binding, or 'default
 *
 * @param {*} binding
 * @return {string}
 */
const getKeyFromBinding = ifElse(equals('true'), always('default'), prop('value'));


/**
 * Appends a value to an array, creating the array if it is undefined
 */
const keyboard = {
  bind: function(el, binding, vnode) {
    const key = getKeyFromBinding(binding);

    if(!navigationLists[key]) {
      navigationLists[key] = new NavigationList({
        sortBeforeUpdate: defaultTo(false, binding.modifiers.sort)
      });
    }

    navigationLists[key].registerElement(el);
  },

  unbind: function(el, binding) {
    const key = getKeyFromBinding(binding);
    navigationLists[key].unregisterElement(el);
  }
};

const KeyboardMixin = {
  directives: { keyboard }
};

export default KeyboardMixin;