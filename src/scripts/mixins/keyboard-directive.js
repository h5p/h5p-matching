import Vue from 'vue';
import Keyboard from './keyboard';

const elementLists = [];

const keyboard = {
  addToElementList: function(key, el) {
    if(elementLists[key] === undefined) {
      elementLists[key] = new Keyboard();
    }

    elementLists[key].addElement(el);
  },

  bind: function(el, binding, vnode) {
    const key  = binding.value === true ? 'default' : binding.value;
    binding.def.addToElementList(key, el);
    console.log('binding', binding, vnode);
  },

  unbind: function(el, binding) {

  },

  inserted: function(el, binding) {
    //  TODO Ensure value is string
    const key  = binding.value === true ? 'default' : binding.value;
    this.addToElementList(key, el);
  },

  componentUpdated: function(el, binding) {
    /*if (binding.modifiers.lazy) {
      if (Boolean(binding.value) === Boolean(binding.oldValue)) {
        return;
      }
    }*/
  },
};

const mixin = {
  directives: { keyboard },
  inserted: function(el) {
    console.log('created', this, el);
  },
};

export default mixin;