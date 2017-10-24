<template>
  <div role="region" class="h5p-combine-pairs" :class="'h5p-combine-pairs-' + choiceType">
    <h3 class="feedback-title" v-html="title"></h3>

    <div class="h5p-choice-lists">
      <choice-list ref="left" name="left" list-class="h5p-choice-list-left" v-bind:choice-type="choiceType"></choice-list>
      <choice-list ref="right" name="right" list-class="h5p-choice-list-right" choice-type="text"></choice-list>
    </div>

    <div ref="scoreBar" class="score-bar" v-show="state !== 'default'"></div>

    <div class="h5p-question-buttons" v-if="state !== 'global-show-solution'">
      <button class="h5p-question-check-answer h5p-joubelui-button" @click="showResults" v-if="state === 'default'">{{i18n.checkAnswer}}</button>
      <button class="h5p-question-show-solution h5p-joubelui-button" @click="showSolution" v-if="displayShowSolutionButton(state)">{{i18n.showSolutionButton}}</button>
      <button class="h5p-question-try-again h5p-joubelui-button" @click="retry" v-if="displayRetrySolutionButton(state)">{{i18n.tryAgain}}</button>
    </div>
  </div>
</template>

<script>
  import appState from '../components/app-state';
  import pairState from '../components/pair-state';
  import defaultTranslations from '../components/default-translations';
  import { jQuery as $, JoubelScoreBar } from '../components/globals'
  import { addIndex, assoc, equals, forEach, head, length, map, range, tail } from 'ramda';

  /**
   * Function map
   * @function
   */
  const mapIndexed = addIndex(map);

  /**
   * Switch places of two elements in an array
   * @param {Array} arr
   * @param {number} fromIndex
   * @param {number} toIndex
   */
  const switchArrayElements = (arr, fromIndex, toIndex) => {
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
  const forEachDelayed = (arr, callback, delay) => {
    callback(head(arr));

    if(length(arr) > 1) {
      setTimeout(() => forEachDelayed(tail(arr), callback, delay), delay)
    }
  };

  /**
   * Vue configuration
   */
  export default {
    data: () => ({
      pairs: {},
      title: 'Combine the data',
      i18n: defaultTranslations,
      state: appState.DEFAULT,
      choiceType: 'text',
      enableRetry: true,
      enableSolutionsButton: true
    }),

    methods: {
      /**
       * Returns true if the "Show solutions" button should be displayed
       */
      displayShowSolutionButton: function(state) {
        return this.enableSolutionsButton
          && state !== 'default'
          && state !== 'show-solution';
      },

      /**
       * Returns true if the retry button should be displayed
       * @return {boolean}
       */
      displayRetrySolutionButton: function(state) {
        return this.enableRetry && state !== 'default';
      },

      /**
       * Returns true if both sides has a selected choice
       * @return {boolean}
       */
      isBothSidesSelected: function() {
        return this.$refs.left.hasSelected()
          && this.$refs.right.hasSelected();
      },

      /**
       * Returns true if the pair at an index is matched
       *
       * @param {number} index
       * @return {boolean}
       */
      isMatched: function(index) {
        return index !== undefined
          && this.$refs.left.getState(index) === pairState.MATCHED
          && this.$refs.right.getState(index) === pairState.MATCHED;
      },

      /**
       * Handle click on choice
       */
      handleSelected: function(current, other) {
        const index = current.getSelectedIndex();

        if (this.isMatched(index)) {
          this.forEachSide((side) => {
            side.setState(index, pairState.NONE);
            side.unsetSelectedIndex();
          });
        }
        else if(this.isBothSidesSelected()) {
          if(other.selectedIndex !== current.selectedIndex) {
            switchArrayElements(other.list, other.selectedIndex, current.selectedIndex);
            other.selectedIndex = current.selectedIndex;
          }

          // set sides to matched
          this.forEachSide((side) => {
            side.setSelectedChoiceState(pairState.MATCHED);
            side.unsetSelectedIndex();
          });
        }
      },

      /**
       * Displays the results and updates the score bar
       */
      showResults: function() {
        forEachDelayed(this.range(), index => {
          const isCorrect = this.isPairCorrect(index);
          const state = isCorrect ? pairState.SUCCESS : pairState.FAILURE;

          this.forEachSide(side => side.setState(index, state));
        }, 100);

        this.state = appState.CHECK_RESULT;
        this.updateScoreBar();
        this.$emit('answered', {
          pairs: this.getPairs()
        });
      },

      /**
       * Returns answers in pairs
       *
       * @return {Pair[]}
       */
      getPairs: function () {
        return this.range().map(index => ({
          left: this.$refs.left.list[index],
          right: this.$refs.right.list[index],
        }));
      },

      /**
       * Returns true if the pair at an index is correct
       * @param {number} index
       * @return {boolean}
       */
      isPairCorrect: function(index) {
        const leftElement = this.$refs.left.list[index];
        const rightElement = this.$refs.right.list[index];

        return equals(leftElement.id, rightElement.id);
      },

      /**
       * Displays the solution, and sets the view in a new state
       * @param {appState} newState
       */
      showSolution: function (newState = appState.SHOW_SOLUTION) {
        const leftList = this.$refs.left.list;

        leftList.forEach((choice, index) => {
          if(choice.state !== pairState.SUCCESS) {
            const otherIndex = this.$refs.right.getIndexById(choice.id);

            switchArrayElements(this.$refs.right.list, index, otherIndex);

            // apply show solution to both lists on THIS index
            this.forEachSide(side => side.setState(index ,pairState.SHOW_SOLUTION))
          }
        });

        this.state = newState;
      },

      /**
       * Resets the state to the initial state
       */
      retry: function () {
        this.range().forEach(index => {
          this.$refs.left.setState(index, pairState.NONE);
          this.$refs.right.setState(index, pairState.NONE);
        });

        this.forEachSide(side => side.unsetSelectedIndex());

        this.state = appState.DEFAULT;
      },

      /**
       * Calls the callback function on both ChoiceLists
       *
       * @param {function} callback
       */
      forEachSide: function(callback) {
        forEach(callback, [this.$refs.left, this.$refs.right]);
      },

      /**
       *
       */
      getCurrentState: function() {
        return {
          source: this.$refs.left.getCurrentState(),
          target: this.$refs.right.getCurrentState()
        }
      },

      /**
       * Returns true if the user has started answering
       * @return {boolean}
       */
      getAnswerGiven: function() {
        return this.$refs.left.list
          .some(choice => choice.state !== pairState.NONE)
      },

      /**
       * Returns the current score
       * @return {number}
       */
      getScore: function() {
        return this.range().reduce((sum, index) => sum + (this.isPairCorrect(index) ? 1 : 0), 0);
      },

      /**
       * Initializes the scorebar if it doesn't exist
       * @param {number} maxScore
       */
      initScoreBar: function(maxScore) {
        if (!this.scoreBar) {
          this.scoreBar = new JoubelScoreBar(maxScore);
          this.scoreBar.appendTo($(this.$refs.scoreBar));
        }
      },

      /**
       * Updates the scorebar
       */
      updateScoreBar: function() {
        this.scoreBar.setScore(this.getScore());
      },

      /**
       * Returns a range with indexes for choice lists
       * Example: [0, 1, 2, 3]
       * @return {number[]}
       */
      range: function() {
        return range(0, this.pairsLength);
      }
    },

    watch: {
      /**
       * Generates shuffled right and left lists
       * @param {Pair[]} pairs
       */
      pairs: function({ sourceList, targetList }) {
        const initPosition = mapIndexed((choice, index) => assoc('position', index, choice));

        this.$refs.left.list = initPosition(sourceList);
        this.$refs.right.list = initPosition(targetList);

        this.$refs.left.$on('select', () => {
          this.handleSelected(this.$refs.left, this.$refs.right);
          this.$emit('interacted')
        });

        this.$refs.right.$on('select', () => {
          this.handleSelected(this.$refs.right, this.$refs.left);
          this.$emit('interacted')
        });

        this.pairsLength = sourceList.length;
        this.initScoreBar(sourceList.length);
      }
    }
  }
</script>

<style lang="scss"  type="text/scss">
  @import '../../styles/variables';

  $border-radius-choice: 0.5em;

  .h5p-combine-pairs {
    padding: 1em;

    .hidden {
      display: none;
    }

    .h5p-choice-lists {
      margin-right: auto;
      display: flex;
    }

    &.h5p-combine-pairs-image .h5p-choice-lists {
      max-width: ($width-component / 2) + $choice-height + $choice-padding;
    }

    &.h5p-combine-pairs-text .h5p-choice-lists {
      max-width: $width-component;
    }

    .h5p-text-choice-list {
      flex: 1;
    }

    .h5p-choice-list-left {
      .h5p-choice {
        border-radius: $border-radius-choice 0 0 $border-radius-choice;
      }

      .h5p-choice-selected,
      .h5p-choice-success,
      .h5p-choice-failure,
      .h5p-choice-matched,
      .h5p-choice-show-solution {
        transform: translateX($element-displacement);
      }
    }

    .h5p-choice-list-right {
      .h5p-choice {
        border-radius: 0 $border-radius-choice $border-radius-choice 0;
        transform: translateX($element-displacement);
      }

      .h5p-choice-selected,
      .h5p-choice-success,
      .h5p-choice-failure,
      .h5p-choice-matched,
      .h5p-choice-show-solution {
        padding-left: 2.2em;
        transform: translateX(0);
      }
    }

    .score-bar {
      margin-bottom: 1em;
    }

    .h5p-question-buttons .h5p-joubelui-button:first-child {
      margin-left: 0;
    }
  }
</style>