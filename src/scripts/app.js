import Vue from 'vue'
import CombinePairs from './views/CombinePairs.vue';
import ChoiceList from './views/ChoiceList.vue';
import Choice from './views/Choice.vue';
import ResultIndicator from './views/ResultIndicator.vue';
import { EventDispatcher } from './components/globals'
import appState from './components/app-state';

// Register components
Vue.component('choice', Choice);
Vue.component('resultIndicator', ResultIndicator);

/**
 * @typedef {object} PairProperty
 * @property {string} title
 * @property {string} image
 */
/**
 * @typedef {object} Pair
 * @property {PairProperty} left
 * @property {PairProperty} right
 */
/**
 * @class
 */
export default class App extends EventDispatcher {
  /**
   * @constructor
   *
   * @param {object} config
   * @param {Pair[]} config.pairs
   * @param {string} config.title
   * @param {object} config.i18n
   * @param {string} contentId
   * @param {object} contentData
   */
  constructor(config, contentId, contentData = {}) {
    super();
    const rootElement = document.createElement('div');

    const viewModel = new Vue({
      ...CombinePairs,
      components: {
        choiceList: ChoiceList
      }
    });

    viewModel.title = config.title;
    viewModel.pairs = config.pairs;

    viewModel.$watch('state', () => this.trigger('resize'));

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
    this.getAnswerGiven = () => {
      return viewModel.getAnswerGiven();
    };

    /**
     * Returns the score for this task
     *
     * @return {number}
     */
    this.getScore = () => {
      return viewModel.getScore();
    };

    /**
     * Returns the max score for this task
     *
     * @return {number}
     */
    this.getMaxScore = () => {
      return config.pairs.length;
    };

    /**
     * Displays the solution(s) for this task, should also hide all buttons.
     */
    this.showSolutions = () => {
      viewModel.showSolution(appState.GLOBAL_SHOW_SOLUTION);
    };

    /**
     *  Resets the task to its initial state
     */
    this.resetTask = () => {
      viewModel.retry();
    };

    /**
     * Retrieves the xAPI data necessary for generating result reports.
     */
    this.getXAPIData = () => {

    };
  }
}
