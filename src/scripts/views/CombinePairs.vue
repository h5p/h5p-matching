<template>
  <div role="region" class="h5p-combine-pairs">
    <h3 class="feedback-title" v-html="title"></h3>

    <pair-list ref="left" name="left" list-class="h5p-pair-list-left"></pair-list>
    <pair-list ref="right" name="right" list-class="h5p-pair-list-right"></pair-list>
    <button @click="showResults">Show results</button>
  </div>
</template>

<script>
  import shuffle from 'shuffle-array';
  import State from '../components/state';
  import { range, zip, max } from 'ramda';

  const MIN_SCORE = 0;

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

      handleSelected: function(current, other) {
        if(this.isBothSidesSelected()) {
          if(other.selectedIndex !== current.selectedIndex){
            other.switchElementPlaces(other.selectedIndex, current.selectedIndex);
            other.selectedIndex = current.selectedIndex;
          }

          // set sides to matched
          setTimeout(() => {
            current.setState(current.getSelectedIndex(), State.MATCHED);
            other.setState(other.getSelectedIndex(), State.MATCHED);
            current.selectedIndex = undefined;
            other.selectedIndex = undefined;
          }, 600);
        }
      },

      addPairKey: function(pair, index) {
        pair.left.pairKey = index;
        pair.right.pairKey = index;
      },

      showResults: function() {
        range(0, this.pairsLength).forEach(index => {
          const isCorrect = this.isPairCorrect(index);

          this.$refs.left.setState(index, isCorrect ? State.SUCCESS : State.FAILURE);
          this.$refs.right.setState(index, isCorrect ? State.SUCCESS : State.FAILURE);
        });
      },

      isPairCorrect: function(index) {
        const leftElement = this.$refs.left.list[index];
        const rightElement = this.$refs.right.list[index];

        return leftElement.pairKey === rightElement.pairKey;
      },

      getScore: function() {
        return max(range(0, this.pairsLength)
          .reduce(index => this.isPairCorrect(index) ? 1 : 0, 0), MIN_SCORE);
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
  $width-component: 600px;
  $width-selected-displacement: 40px;
  $border-radius-element: 10px;

  .h5p-combine-pairs {
    .h5p-element-success {
      background-color: green;
    }

    .h5p-element-failure {
      background-color: red;
    }

    .h5p-pair-list-left {
      background-color: lightblue;
      text-align: right;

      .h5p-element {
        border-radius: $border-radius-element 0 0 $border-radius-element;
      }

      .h5p-element-selected {
        transform: translateX($width-selected-displacement);
      }

      .h5p-element-success,
      .h5p-element-failure,
      .h5p-element-matched {
        transform: translateX($width-selected-displacement * 2.7);
      }
    }

    .h5p-pair-list-right {
      background-color: lightgreen;

      .h5p-element {
        border-radius: 0 $border-radius-element $border-radius-element 0;
      }

      .h5p-element-selected {
        transform: translateX($width-selected-displacement * -1);
      }

      .h5p-element-success,
      .h5p-element-failure,
      .h5p-element-matched {
        transform: translateX($width-selected-displacement * -2.7);
      }
    }
  }
</style>