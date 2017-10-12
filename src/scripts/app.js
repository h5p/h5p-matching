import Vue from 'vue'
import CombinePairsView from './views/CombinePairs.vue';
import ChoiceListView from './views/ChoiceList.vue';
import TextChoiceView from './views/TextChoice.vue';
import ImageChoiceView from './views/ImageChoice.vue';
import ResultIndicatorView from './views/ResultIndicator.vue';
import { EventDispatcher, getPath } from './components/globals';
import { setDefinitionOnXapiEvent, setResponseOnXApiEvent } from './components/xapi';
import appState from './components/app-state';
import pairState from './components/pair-state';

// Register components
Vue.component('textChoice', TextChoiceView);
Vue.component('imageChoice', ImageChoiceView);
Vue.component('resultIndicator', ResultIndicatorView);

/**
 * @enum {string}
 */
const side = {
  SOURCE: 'source',
  TARGET: 'target'
};

/**
 * @typedef {object} PairConfig
 * @property {string} image
 * @property {string} source
 * @property {string} target
 */
/**
 * @typedef {object} Choice
 * @property {number} id
 * @property {string} title
 * @property {string} image
 * @property {pairState} state
 * @property {number} position
 */
/**
 * @typedef {object} Pair
 * @property {Choice} left
 * @property {Choice} right
 */
/**
 * Initializes choices
 *
 * @param {PairConfig[]} pairConfigs
 * @param {string} side
 * @param {string} contentId
 *
 * @return {Choice[]}
 */
const initPairs = (pairConfigs, side, contentId) =>
   pairConfigs.map((config, index) => ({
    id: index,
    title: config[side],
    state: pairState.NONE,
    image: getPath(config.image.path, contentId),
    position: index
  }));


/**
 * @class
 * @extends {EventDispatcher}
 */
export default class App extends EventDispatcher {
  /**
   * @constructor
   *
   * @param {object} config
   * @param {PairConfig[]} config.pairs
   * @param {string} config.title
   * @param {string} config.choiceType
   * @param {object} config.i18n
   * @param {string} contentId
   * @param {object} contentData
   */
  constructor(config, contentId, contentData = {}) {
    super();
    const rootElement = document.createElement('div');

    const sourceList = initPairs(config.pairs, side.SOURCE, contentId);
    const targetList = initPairs(config.pairs, side.TARGET, contentId);

    const maxScore = config.pairs.length;

    const viewModel = new Vue({
      ...CombinePairsView,
      components: {
        choiceList: ChoiceListView
      }
    });

    viewModel.choiceType = config.choiceType;
    viewModel.title = config.title;
    viewModel.pairs = { sourceList, targetList };

    // Resize on state change
    viewModel.$watch('state', () => this.trigger('resize'));

    // propagate 'interacted' event
    viewModel.$on('interacted', () => {
      this.triggerXAPI('interacted');
    });

    // propagate answered event
    viewModel.$on('answered', ({ pairs }) => {
      const score = viewModel.getScore();
      const event = this.createXAPIEventTemplate('answered');
      event.setScoredResult(score, maxScore, this, true, score === maxScore); // TODO var success = (100 * score / maxScore) >= params.behaviour.passPercentage;
      setDefinitionOnXapiEvent(event, config.title, pairs);
      setResponseOnXApiEvent(event, pairs);
      this.trigger(event)
    });

    /**
     * Attach library to wrapper
     *
     * @param {jQuery} $wrapper
     */
    this.attach = function ($wrapper) {
      $wrapper.get(0).appendChild(rootElement);
      viewModel.$mount(rootElement);
    };

    /**
     * Returns true if answers have been given
     *
     * @return {boolean}
     */
    this.getAnswerGiven = () => viewModel.getAnswerGiven();

    /**
     * Returns the score for this task
     *
     * @return {number}
     */
    this.getScore = () => viewModel.getScore();

    /**
     * Returns the max score for this task
     *
     * @return {number}
     */
    this.getMaxScore = () =>  maxScore;

    /**
     * Displays the solution(s) for this task, should also hide all buttons.
     */
    this.showSolutions = () => viewModel.showSolution(appState.GLOBAL_SHOW_SOLUTION);

    /**
     *  Resets the task to its initial state
     */
    this.resetTask = () => viewModel.retry();

    /**
     * Retrieves the xAPI data necessary for generating result reports.
     */
    this.getXAPIData = () => {

    };
  }
}