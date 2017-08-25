import { setAttribute, removeAttribute, hasAttribute } from './elements';
import { forEach, without } from 'ramda';

/**
 * @event Keyboard#sdk.keyboard.update
 * @type {object}
 * @param {Element} element
 * @param {number} index
 */
/**
 * @event Keyboard#sdk.keyboard.focus
 * @type {object}
 * @param {Element} element
 * @param {number} index
 */

/**
 * @param {HTMLElement} element
 * @function
 */
const addTabIndex = setAttribute('tabindex', '0');

/**
 * @param {HTMLElement} element
 * @function
 */
const removeTabIndex = removeAttribute('tabindex');

/**
 * @param {HTMLElement[]} elements
 * @function
 */

const removeTabIndexForAll = forEach(removeTabIndex);

/**
 * @param {HTMLElement} element
 * @function
 */
const hasTabIndex = hasAttribute('tabindex');

/**
 * Creates a custom event
 *
 * @param {string} type
 * @param {Element} element
 * @param {number} index
 *
 * @return {boolean}
 */
const triggerEvent = (type, element, index) => {
  const event = document.createEvent('CustomEvent');
  event.initCustomEvent(type, true, true, { element, index});
  return  element.dispatchEvent(event);
};

/**
 * Sets tabindex and focus on an element, remove it from all others
 *
 * @param {HTMLElement[]} elements
 * @param {number} index
 *
 * @fires Keyboard#sdk.keyboard.update
 */
const updateTabbable = (elements, index) => {
  const selectedElement = elements[index];

  if(selectedElement) {
    removeTabIndexForAll(elements);
    addTabIndex(selectedElement);
    triggerEvent('sdk.keyboard.update', selectedElement, index);
  }
};

/**
 * Sets tabindex on an element, remove it from all others
 *
 * @param {number} currentIndex
 * @param {number} lastIndex
 *
 * @return {number}
 */
const nextIndex = (currentIndex, lastIndex) => (currentIndex === lastIndex) ? 0 : (currentIndex + 1);

/**
 * Sets tabindex on an element, remove it from all others
 *
 * @param {number} currentIndex
 * @param {number} lastIndex
 *
 * @return {number}
 */
const previousIndex = (currentIndex, lastIndex) => (currentIndex === 0) ? lastIndex : (currentIndex - 1);

/**
 * @class
 */
export default class Keyboard {
  constructor() {
    /**
     * @property {HTMLElement[]} elements
     */
    this.elements = [];
    /**
     * Creates a bound key handler, that can be removed
     * @property {function} boundHandleKeyDown
     */
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleFocus = this.handleFocus.bind(this);
    /**
     * @property {number} selectedIndex
     */
    this.selectedIndex = 0;
  }

  /**
   * Add keyboard support to an element
   *
   * @param {HTMLElement} element
   *
   * @public
   * @return {HTMLElement}
   */
  addElement(element) {
    this.elements.push(element);
    element.addEventListener('keydown', this.boundHandleKeyDown);
    element.addEventListener('focus', this.boundHandleFocus);

    if (this.elements.length === 1) { // if first
      addTabIndex(element);
    }

    return element
  };

  /**
   * Add controls to an element
   *
   * @param {HTMLElement} element
   *
   * @public
   * @return {HTMLElement}
   */
  removeElement(element) {
    this.elements = without([element], this.elements);

    element.removeEventListener('keydown', this.boundHandleKeyDown);
    element.removeEventListener('focus', this.boundHandleFocus);

    // if removed element was selected
    if(hasTabIndex(element)) {
      removeTabIndex(element);

      this.selectedIndex = 0;
      updateTabbable(this.elements, this.selectedIndex);
    }

    return element;
  };

  /**
   * Handles key down, and updates the tab index
   *
   * @param {KeyboardEvent} event Keyboard event
   *
   * @fires Keyboard#sdk.keyboard.focus
   * @private
   */
  handleKeyDown(event) {
    const lastIndex = this.elements.length - 1;

    if(this.hasElement(event.target)) {
      switch (event.which) {
        case 13: // Enter
        case 32: // Space
          this.select();
          event.preventDefault();
          break;
        case 35: // End
          this.selectedIndex = lastIndex;
          event.preventDefault();
          break;
        case 36: // Home
          this.selectedIndex = 0;
          event.preventDefault();
          break;
        case 37: // Left Arrow
        case 38: // Up Arrow
          this.selectedIndex = previousIndex(this.selectedIndex, lastIndex);
          event.preventDefault();
          break;
        case 39: // Right Arrow
        case 40: // Down Arrow
          this.selectedIndex = nextIndex(this.selectedIndex, lastIndex);
          event.preventDefault();
          break;
        default:
          return;
      }

      // move tabindex to currently selected
      updateTabbable(this.elements, this.selectedIndex);

      // set focus
      const selectedElement = this.elements[this.selectedIndex];
      if(triggerEvent('sdk.keyboard.focus', selectedElement, this.selectedIndex) !== false) {
        selectedElement.focus();
      }
    }
  };

  /**
   * Returns true if element is in list ov navigatable elements
   *
   * @param {Element|EventTarget} element
   *
   * @return {boolean}
   */
  hasElement(element) {
    return this.elements.indexOf(element) !== -1;
  }

  /**
   * Updates the selected index with the focused element
   *
   * @param {FocusEvent} event
   */
  handleFocus(event) {
    this.selectedIndex = this.elements.indexOf(event.target);
  }

  /**
   * Sets the selected index, and updates the tab index
   *
   * @param {number} index
   */
  forceSelectedIndex(index) {
    this.selectedIndex = index;
    updateTabbable(this.elements, this.selectedIndex);
  }

  /**
   * Triggers 'onSelect' function if it exists
   */
  select() {
    if(this.onSelect != undefined) {
      this.onSelect(this.elements[this.selectedIndex]);
    }

    triggerEvent('sdk.keyboard.select', this.elements[this.selectedIndex], this.selectedIndex)
  }
}