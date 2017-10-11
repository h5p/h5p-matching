<template>
  <div role="region" class="h5p-combine-pairs">
    <h3 class="feedback-title" v-html="title"></h3>

    <div class="h5p-choice-lists">
      <choice-list ref="left" name="left" list-class="h5p-choice-list-left"></choice-list>
      <choice-list ref="right" name="right" list-class="h5p-choice-list-right"></choice-list>
    </div>

    <div class="h5p-question-buttons">
      <button class="h5p-question-check-answer h5p-joubelui-button" @click="showResults">Check</button>
      <button class="h5p-question-show-solution h5p-joubelui-button" @click="showResults">Show Solution</button>
      <button class="h5p-question-try-again h5p-joubelui-button" @click="showResults">Retry</button>
    </div>
  </div>
</template>

<script>
  import shuffle from 'shuffle-array';
  import pairState from '../components/pair-state';
  import { range, zip, max, head, tail, length } from 'ramda';

  const MIN_SCORE = 0;

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
      pairs: [],
      title: 'Combine the data',
      i18n: {},
      solution: {}
    }),

    methods: {
      addPosition: function(el, index) {
        el.position = index;
        return el;
      },

      isBothSidesSelected: function() {
        return this.$refs.left.hasSelected()
          && this.$refs.right.hasSelected();
      },

      isMatched: function(index) {
        return index !== undefined
          && this.$refs.left.getState(index) === pairState.MATCHED
          && this.$refs.right.getState(index) === pairState.MATCHED;
      },

      handleSelected: function(current, other) {
        const index = current.getSelectedIndex();

        if (this.isMatched(index)) {
          current.setState(index, pairState.NONE);
          other.setState(index, pairState.NONE);
          current.selectedIndex = undefined;
          other.selectedIndex = undefined;
        }
        else if(this.isBothSidesSelected()) {
          if(other.selectedIndex !== current.selectedIndex) {
            switchArrayElements(other.list, other.selectedIndex, current.selectedIndex);
            other.selectedIndex = current.selectedIndex;
          }

          // set sides to matched
          current.setSelectedChoiceState(pairState.MATCHED);
          other.setSelectedChoiceState(pairState.MATCHED);
          current.selectedIndex = undefined;
          other.selectedIndex = undefined;
        }
      },

      addPairKey: function(pair, index) {
        pair.left.pairKey = index;
        pair.right.pairKey = index;
      },

      showResults: function() {
        const indexes = range(0, this.pairsLength);

        forEachDelayed(indexes, index => {
          const isCorrect = this.isPairCorrect(index);
          const state = isCorrect ? pairState.SUCCESS : pairState.FAILURE;

          this.$refs.left.setState(index, state);
          this.$refs.right.setState(index, state);
        }, 100);
      },

      isPairCorrect: function(index) {
        const leftElement = this.$refs.left.list[index];
        const rightElement = this.$refs.right.list[index];

        return leftElement.pairKey === rightElement.pairKey;
      },

      getScore: function() {
        return max(range(0, this.pairsLength)
          .reduce((sum, index) =>  sum + this.isPairCorrect(index) ? 1 : 0, 0), MIN_SCORE);
      }
    },

    watch: {
      /**
       * Generates shuffled right and left lists
       * @param {Pair[]} pairs
       */
      pairs: function(pairs) {
        pairs.forEach(this.addPairKey);

        this.$refs.left.list = shuffle(pairs.map(pair => pair.left)).map(this.addPosition);
        this.$refs.right.list = shuffle(pairs.map(pair => pair.right)).map(this.addPosition);

        this.$refs.left.$on('select', () => {
          this.handleSelected(this.$refs.left, this.$refs.right);
        });

        this.$refs.right.$on('select', () => {
          this.handleSelected(this.$refs.right, this.$refs.left);
        });

        this.pairsLength = pairs.length;
      }
    }
  }
</script>

<style lang="scss"  type="text/scss">
  @import '../../styles/variables';

  $border-radius-choice: 0.5em;

  .h5p-combine-pairs {
    .h5p-choice-lists {
      max-width: $width-component;
      margin-left: auto;
      margin-right: auto;
      display: flex;
    }

    .h5p-choice-list {
      flex: 1;
    }

    .h5p-choice-list-left {
      .h5p-choice {
        border-radius: $border-radius-choice 0 0 $border-radius-choice;
      }

      .h5p-choice-selected,
      .h5p-choice-success,
      .h5p-choice-failure,
      .h5p-choice-matched {
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
      .h5p-choice-matched {
        padding-left: 2.2em;
        transform: translateX(0);
      }
    }
  }
</style>