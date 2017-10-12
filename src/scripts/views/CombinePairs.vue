<template>
  <div role="region" class="h5p-combine-pairs" :class="'h5p-combine-pairs-' + choiceType">
    <h3 class="feedback-title" v-html="title"></h3>

    <div class="h5p-choice-lists">
      <choice-list ref="left" name="left" list-class="h5p-choice-list-left" v-bind:choice-type="choiceType"></choice-list>
      <choice-list ref="right" name="right" list-class="h5p-choice-list-right" choice-type="text"></choice-list>
    </div>

    <div ref="scoreBar" class="score-bar" v-show="state !== 'default'"></div>

    <div class="h5p-question-buttons" v-if="state !== 'global-show-solution'">
      <button class="h5p-question-check-answer h5p-joubelui-button" @click="showResults" v-if="state === 'default'">Check</button>
      <button class="h5p-question-show-solution h5p-joubelui-button" @click="showSolution" v-if="state !== 'default' && state !== 'show-solution'">Show Solution</button>
      <button class="h5p-question-try-again h5p-joubelui-button" @click="retry" v-if="state !== 'default'">Retry</button>
    </div>
  </div>
</template>

<script>
  import shuffle from 'shuffle-array';
  import appState from '../components/app-state';
  import pairState from '../components/pair-state';
  import { jQuery as $, JoubelScoreBar } from '../components/globals'
  import { range, head, tail, length, assoc } from 'ramda';

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
      i18n: {},
      state: appState.DEFAULT,
      choiceType: 'text'
    }),

    methods: {
      isBothSidesSelected: function() {
        return this.$refs.left.hasSelected()
          && this.$refs.right.hasSelected();
      },

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
          current.setState(index, pairState.NONE);
          other.setState(index, pairState.NONE);
          current.unsetSelectedIndex();
          other.unsetSelectedIndex();
        }
        else if(this.isBothSidesSelected()) {
          if(other.selectedIndex !== current.selectedIndex) {
            switchArrayElements(other.list, other.selectedIndex, current.selectedIndex);
            other.selectedIndex = current.selectedIndex;
          }

          // set sides to matched
          current.setSelectedChoiceState(pairState.MATCHED);
          other.setSelectedChoiceState(pairState.MATCHED);
          current.unsetSelectedIndex();
          other.unsetSelectedIndex();
        }
      },

      showResults: function() {
        forEachDelayed(this.range(), index => {
          const isCorrect = this.isPairCorrect(index);
          const state = isCorrect ? pairState.SUCCESS : pairState.FAILURE;

          this.$refs.left.setState(index, state);
          this.$refs.right.setState(index, state);
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

      isPairCorrect: function(index) {
        const leftElement = this.$refs.left.list[index];
        const rightElement = this.$refs.right.list[index];

        return leftElement.id === rightElement.id;
      },

      showSolution: function (newState = appState.SHOW_SOLUTION) {
        const leftList = this.$refs.left.list;

        leftList.forEach((choice, index) => {
          if(choice.state !== pairState.SUCCESS) {
            const otherIndex = this.$refs.right.getIndexById(choice.id);

            switchArrayElements(this.$refs.right.list, index, otherIndex);
            this.$refs.left.setState(index ,pairState.SHOW_SOLUTION);
            this.$refs.right.setState(index ,pairState.SHOW_SOLUTION);
          }
        });

        this.state = newState;
      },

      retry: function () {
        this.range().forEach(index => {
          this.$refs.left.setState(index, pairState.NONE);
          this.$refs.right.setState(index, pairState.NONE);
        });

        this.$refs.left.unsetSelectedIndex();
        this.$refs.right.unsetSelectedIndex();
        this.state = appState.DEFAULT;
      },

      getAnswerGiven: function() {
        this.$refs.left.list
          .some(choice => choice.state !== pairState.NONE)
      },

      getScore: function() {
        return this.range().reduce((sum, index) => sum + (this.isPairCorrect(index) ? 1 : 0), 0);
      },

      initScoreBar: function(maxScore) {
        if (!this.scoreBar) {
          this.scoreBar = new JoubelScoreBar(maxScore);
          this.scoreBar.appendTo($(this.$refs.scoreBar));
        }
      },

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
        const initPosition = (choice, index) => assoc('position', index, choice);

        this.$refs.left.list = shuffle(sourceList).map(initPosition);
        this.$refs.right.list = shuffle(targetList).map(initPosition);

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