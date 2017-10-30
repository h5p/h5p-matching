import { getPath } from './globals';
import pairState from './pair-state';
import { assoc, compose, curry, path, prop, map, zipWith } from 'ramda';
import shuffle from 'shuffle-array';
import { mapIndexed } from './array-utils';
/**
 * Returns the absolute path, if a path exists
 *
 * @param {string} contentId
 * @param {string} path
 */
const getAbsolutePath = (contentId, path) => path ? getPath(path, contentId) : undefined;

/**
 * Returns the image path, if an image is set
 *
 * @param {string} contentId
 * @param {object} config
 */
const getImagePath = (contentId, config) => getAbsolutePath(contentId, path(['image', 'path'], config));

/**
 * Sets the 'imagePath' property on an object, based on the 'image' property
 * @param {string} contentId
 * @param {PairConfig} config
 */
const setImagePath = curry((contentId, config) => assoc('imagePath', getImagePath(contentId, config), config));

/**
 * Orders the choices in a list based on a previous state
 *
 * @param {number[]} order
 * @param {Choice[]} choices
 * @return {Choice[]}
 */
const orderChoices = curry((order, choices) => map(index => choices[index], order));

/**
 * Initiates sets the position to be the same as the index
 * (position is used by "transition-group")
 *
 * @function
 * @param {Choice} choice
 * @param {number} index
 * @return {Choice}
 */
const initPosition = mapIndexed((choice, index) => assoc('position', index, choice));


/**
 * Takes pair config, and creates a Choice
 *
 * @param {string} side
 * @param {config} PairConfig
 * @param {number} index
 * @return {Choice}
 */
const createChoiceFromPairConfig = curry((side, config, index) => ({
  id: index,
  title: config[side],
  state: pairState.NONE,
  imagePath: config.imagePath,
  position: index
}));

/**
 * Restores the state to a choice
 *
 * @function
 * @param {string[]} states
 * @param {Choice[]} choices
 * @return {Choice}
 */
const restoreStateToChoice = zipWith(assoc('state'));

/**
 * Initializes choices
 *
 * @param {PairConfig[]} pairConfigs
 * @param {choiceListName} side
 * @param {string} contentId
 * @param {CurrentState} [previousState]
 *
 * @return {Choice[]}
 */
const initChoices = ({ pairConfigs, side, contentId, previousState = {} }) => {
  const choiceOrder = prop(side, previousState);
  const states = prop('pairStates', previousState);

  const choices = pairConfigs
    .map(setImagePath(contentId))
    .map(createChoiceFromPairConfig(side));

  const restoreState = compose(initPosition, restoreStateToChoice(states), orderChoices(choiceOrder));
  const shuffleChoices = compose(initPosition, shuffle);

  return (choiceOrder ? restoreState : shuffleChoices)(choices);
};

export default initChoices;