<template>
  <div role="region" class="h5p-combine-pairs">
    <h3 class="feedback-title" v-html="title"></h3>

    <pair-list ref="left" list-class="h5p-pair-list-left"></pair-list>
    <pair-list ref="right" list-class="h5p-pair-list-right"></pair-list>
  </div>
</template>

<script>
  import shuffle from 'shuffle-array';
  import Side from '../components/side';

  export default {
    data: () => ({
      pairs: [],
      title: 'Combine the data',
      i18n: {}
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
            current.getSelected().matched = true;
            other.getSelected().matched = true;
            current.selectedIndex = undefined;
            other.selectedIndex = undefined;
          }, 600);
        }
      }
    },

    watch: {
      /**
       * Generates shuffled right and left lists
       * @param {Pair[]} pairs
       */
      pairs: function(pairs) {
        this.leftList = shuffle(pairs.map(pair => pair.left)).map(this.addPosition);
        this.rightList = shuffle(pairs.map(pair => pair.right)).map(this.addPosition);

        this.$refs.left.list = this.leftList;
        this.$refs.right.list = this.rightList;

        this.$refs.left.$on('select', () => {
          this.handleSelected(this.$refs.left, this.$refs.right);
        });

        this.$refs.right.$on('select', () => {
          this.handleSelected(this.$refs.right, this.$refs.left);
        });
      }
    }
  }
</script>

<style lang="scss"  type="text/scss">
  $width-component: 600px;
  $width-selected-displacement: 40px;
  $border-radius-element: 10px;

  .h5p-combine-pairs {
    .h5p-pair-list-left {
      background-color: lightblue;
      text-align: right;

      .h5p-element {
        border-radius: $border-radius-element 0 0 $border-radius-element;
      }

      .h5p-element-selected {
        transform: translateX($width-selected-displacement);
      }

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

      .h5p-element-matched {
        transform: translateX($width-selected-displacement * -2.7);
      }
    }
  }
</style>