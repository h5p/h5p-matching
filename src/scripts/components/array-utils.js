import { addIndex, head, length, map, tail } from 'ramda';

/**
 * Switch places of two elements in an array
 *
 * @param {Array} arr
 * @param {number} fromIndex
 * @param {number} toIndex
 */
export const switchArrayElements = (arr, fromIndex, toIndex) => {
  const element = arr[fromIndex];
  arr[fromIndex] = arr[toIndex];
  arr[toIndex] = element;
};

/**
 * Calls the callback with each element after a given timeout
 *
 * @param {Array} arr
 * @param {Function} callback
 * @param {number} delay
 */
export const forEachDelayed = (arr, callback, delay) => {
  callback(head(arr));

  if(length(arr) > 1) {
    setTimeout(() => forEachDelayed(tail(arr), callback, delay), delay)
  }
};

/**
 * Maps with index
 *
 * @function
 * @template T
 * @param {function(T, number)}
 * @param {array.<T>}
 * @return {array}
 */
export const mapIndexed = addIndex(map);