import { compose, map, join, length, range, prop } from 'ramda';
import choiceListName from './choice-list-name';

const TYPE_INTERACTION = 'http://adlnet.gov/expapi/activities/cmi.interaction';

/**
 * @enum {string}
 */
const xAPIInteractionType = {
  MATCHING: "matching"
};

/**
 * Localizes a string for xapi
 *
 * @param {string} str
 * @param {string} [langCode]
 */
const localizeString = (str, langCode="en-US") => ({ [langCode]: str });

/**
 * Creates a pair of indexes
 *
 * @param {number} index
 * @return {string}
 */
const createPairOfIndexes = index => `${index}[.]${index}`;

/**
 * Returns the indexes of an array
 *
 * @param {array} arr
 * @return {array.<number>}
 */
const keys = compose(range(0), length);

/**
 * Returns the correct response pattern
 *
 * @param {Pair[]} pairs
 * @return {string}
 */
const createCorrectResponsesPattern = compose(join('[,]'), map(createPairOfIndexes), keys);

/**
 * Returns a xapi formatted list of choices
 *
 * @property {Choice} choice
 * @return {array}
 */
const choiceToXapiOption = choice => ({
  id: choice.id.toString(),
  description: localizeString(choice.title)
});

/**
 * Sets the definition field on an xapi event
 *
 * @param {xAPIEvent} event
 * @param {string} title
 * @param {Pair[]} pairs
 */
export const setDefinitionOnXapiEvent = (event, title, pairs) => {
  const definition = event.getVerifiedStatementValue(['object', 'definition']);
  const source = map(prop(choiceListName.SOURCE), pairs);
  const target = map(prop(choiceListName.TARGET), pairs);

  Object.assign(definition, {
    description: localizeString(title),
    type: TYPE_INTERACTION,
    interactionType: xAPIInteractionType.MATCHING,
    correctResponsesPattern: [createCorrectResponsesPattern(pairs)],
    source: map(choiceToXapiOption, source),
    target: map(choiceToXapiOption, target)
  })
};

/**
 * Sets the response on an xapi event
 *
 * @param {xAPIEvent} event
 * @param {Pair[]} pairs
 */
export const setResponseOnXApiEvent = (event, pairs) => {
  event.data.statement.result.response = pairs
    .map(pair => `${pair[choiceListName.SOURCE].id}[.]${pair[choiceListName.TARGET].id}`)
    .join('[,]');
};