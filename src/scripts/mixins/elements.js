import {curry, inverseBooleanString} from './functional'

/**
 * Get an attribute value from element
 *
 * @param {string} name
 * @param {HTMLElement} el
 *
 * @function
 * @return {string}
 */
export const getAttribute = curry((name, el) => el.getAttribute(name));

/**
 * Set an attribute on a html element
 *
 * @param {string} name
 * @param {string} value
 * @param {HTMLElement} el
 *
 * @function
 */
export const setAttribute = curry((name, value, el) => el.setAttribute(name, value));

/**
 * Remove attribute from html element
 *
 * @param {string} name
 * @param {HTMLElement} el
 *
 * @function
 */
export const removeAttribute = curry((name, el) => el.removeAttribute(name));

/**
 * Check if element has an attribute
 *
 * @param {string} name
 * @param {HTMLElement} el
 *
 * @function
 * @return {boolean}
 */
export const hasAttribute = curry((name, el) => el.hasAttribute(name));

/**
 * Check if element has an attribute that equals
 *
 * @param {string} name
 * @param {string} value
 * @param {HTMLElement} el
 *
 * @function
 * @return {boolean}
 */
export const attributeEquals = curry((name, value, el) => el.getAttribute(name) === value);

/**
 * Toggles an attribute between 'true' and 'false';
 *
 * @param {string} name
 * @param {HTMLElement} el
 *
 * @function
 */
export const toggleAttribute = curry((name, el) => {
  const value = getAttribute(name, el);
  setAttribute(name, inverseBooleanString(value), el);
});

/**
 * The appendChild() method adds a node to the end of the list of children of a specified parent node.
 *
 * @param {HTMLElement} parent
 * @param {HTMLElement} child
 *
 * @function
 * @return {HTMLElement}
 */
export const appendChild = curry((parent, child) => parent.appendChild(child));

/**
 * Returns the first element that is a descendant of the element on which it is invoked
 * that matches the specified group of selectors.
 *
 * @param {string} selector
 * @param {HTMLElement} el
 *
 * @function
 * @return {HTMLElement}
 */
export const querySelector = curry((selector, el) => el.querySelector(selector));

/**
 * Transforms a NodeList to an Array
 *
 * @param {NodeList} nodeList
 *
 * @return {Node[]}
 */
export const nodeListToArray = nodeList => Array.prototype.slice.call(nodeList);

/**
 * Returns a non-live NodeList of all elements descended from the element on which it
 * is invoked that matches the specified group of CSS selectors.
 *
 * @param {string} selector
 * @param {HTMLElement} el
 *
 * @function
 * @return {Node[]}
 */
export const querySelectorAll = curry((selector, el) => nodeListToArray(el.querySelectorAll(selector)));

/**
 * The removeChild() method removes a child node from the DOM. Returns removed node.
 *
 * @param {Node} parent
 * @param {Node} oldChild
 *
 * @return {Node}
 */
export const removeChild = curry((parent, oldChild) => parent.removeChild(oldChild));

/**
 * Returns true if a node has a class
 *
 * @param {string} cls
 * @param {HTMLElement} el
 *
 * @function
 */
export const classListContains = curry((cls, el) => el.classList.contains(cls));

/**
 * Adds a css class to an element
 *
 * @param {string} cls
 * @param {Element} element
 *
 * @function
 */
export const addClass = curry((cls, element) => element.classList.add(cls));

/**
 * Removes a css class from an element
 *
 * @param {string} cls
 * @param {Element} element
 *
 * @function
 */
export const removeClass = curry((cls, element) => element.classList.remove(cls));

/**
 * Adds hidden class on an element
 *
 * @param {HTMLElement} element
 * @function
 */
export const hide = addClass('hidden');

/**
 * Removes hidden class from an element
 * @function
 */
export const show = removeClass('hidden');

/**
 * Toggles hidden class on an element
 *
 * @param {boolean} visible
 * @param {HTMLElement} element
 */
export const toggleVisibility = curry((visible, element) => (visible ? show : hide)(element));

/**
 * Toggles a class on an element
 *
 * @param {string} cls
 * @param {boolean} add
 * @param {HTMLElement} element
 */
export const toggleClass = curry((cls, add, element) => {
  element.classList[add ? 'add' : 'remove'](cls)
});

/**
 * Helper for creating a DOM element
 *
 * @function
 *
 * @param {string} tag
 * @param {string} [id]
 * @param {string[]} [classes] - array of strings
 * @param {Object} [attributes]
 *
 * @return {HTMLElement}
 */
export const createElement = ({tag, id, classes, attributes}) => {
  let element = document.createElement(tag);

  if (id) {
    element.id = id;
  }
  if (classes) {
    classes.forEach(clazz => {element.classList.add(clazz)});
  }
  if (attributes) {
    Object.keys(attributes).forEach(key => {element.setAttribute(key, attributes[key])})
  }

  return element;
};