import {curry, invoker, equals, lensProp, over} from 'ramda';

/**
 * Get an attribute value from element
 *
 * @param {string} name
 * @param {HTMLElement} el
 *
 * @function
 * @return {string}
 */
export const getAttribute = invoker(1, 'getAttribute');

/**
 * Set an attribute on a html element
 *
 * @param {string} name
 * @param {string} value
 * @param {HTMLElement} el
 *
 * @function
 */
export const setAttribute = invoker(2, 'setAttribute');

/**
 * Remove attribute from html element
 *
 * @param {string} name
 * @param {HTMLElement} el
 *
 * @function
 */
export const removeAttribute = invoker(1, 'removeAttribute');

/**
 * Check if element has an attribute
 *
 * @param {string} name
 * @param {HTMLElement} el
 *
 * @function
 * @return {boolean}
 */
export const hasAttribute = invoker(1, 'hasAttribute');

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
export const attributeEquals = curry((name, value, el) => equals(value, getAttribute(name, el)));


/**
 * The appendChild() method adds a node to the end of the list of children of a specified parent node.
 *
 * @param {HTMLElement} parent
 * @param {HTMLElement} child
 *
 * @function
 * @return {HTMLElement}
 */
export const appendChild = invoker(1, 'appendChild');

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
export const querySelector = invoker(1, 'querySelector');

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
export const querySelectorAll = invoker(1, 'querySelectorAll');

/**
 * The removeChild() method removes a child node from the DOM. Returns removed node.
 *
 * @param {Node} parent
 * @param {Node} oldChild
 *
 * @function
 * @return {Node}
 */
export const removeChild = invoker(1, 'removeChild');

/**
 *
 */
export const classListLens = lensProp('classList');


/**
 * Returns true if a node has a class
 *
 * @param {string} cls
 * @param {HTMLElement} el
 *
 * @function
 */
export const classListContains = over(classListLens, );
  curry((cls, el) => el.classList.contains(cls));

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
 * Toggles a class on an element
 *
 * @param {string} cls
 * @param {boolean} add
 * @param {HTMLElement} element
 */
export const toggleClass = curry((cls, add, element) => {
  element.classList[add ? 'add' : 'remove'](cls)
});