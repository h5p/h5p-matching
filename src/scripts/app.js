import Vue from 'vue'
import CombinePairs from './views/CombinePairs.vue';
import ChoiceList from './views/ChoiceList.vue';
import Choice from './views/Choice.vue';
import ResultIndicator from './views/ResultIndicator.vue';

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
export default class App extends H5P.EventDispatcher {
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

    /**
     * Attach library to wrapper
     *
     * @param {jQuery} $wrapper
     */
    this.attach = function ($wrapper) {
      $wrapper.get(0).appendChild(rootElement);
      viewModel.$mount(rootElement);
    };
  }
}
