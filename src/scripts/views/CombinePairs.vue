<template>
  <div role="region" class="h5p-combine-pairs">
    <h3 class="feedback-title" v-html="title"></h3>

    <!--<pair-list ref="left"></pair-list>-->

    <transition-group name="pair-list-left" tag="ul" class="h5p-pair-list h5p-pair-list-left unstyled-list" @after-leave="leave" @animationend="leave">
      <li v-for="(element, index) in left" v-bind:key="element.position" v-bind:data-index="index" class="h5p-element" :class="{ 'h5p-element-matched' : element.matched, 'h5p-element-selected' : (index === selectedIndex.left)}" tabindex="0" @click="selectElement(index, 'left')">
        {{element.title}}</li>
    </transition-group>

    <transition-group name="pair-list-right" tag="ul" class="h5p-pair-list h5p-pair-list-right unstyled-list" @after-leave="leave" @animationend="leave">
      <li v-for="(element, index) in right" v-bind:key="element.position" v-bind:data-index="index" class="h5p-element" :class="{ 'h5p-element-matched' : element.matched, 'h5p-element-selected' : (index === selectedIndex.right)}" tabindex="0" @click="selectElement(index, 'right')">
        {{element.title}}</li>
    </transition-group>
  </div>
</template>

<script>
  import shuffle from 'shuffle-array';
  import Side from '../components/side';

  export default {
    data: () => ({
      pairs: [],
      left: [],
      right: [],
      title: 'Combine the data',
      i18n: {},
      selectedIndex: {
        left: undefined,
        right: undefined
      }
    }),

    methods: {
      selectElement: function(index, sideKey) {
        const alreadySelected = this.selectedIndex[sideKey] === index;
        this.selectedIndex[sideKey] = alreadySelected ? undefined : index;

        if(this.bothSidesSelected()) {
          const otherSideKey = Side.getOtherSide(sideKey);
          this.arrayMoveElement(this[otherSideKey],  this.selectedIndex[otherSideKey], this.selectedIndex[sideKey]);

          this.selectedIndex[otherSideKey] = this.selectedIndex[sideKey];

          // set sides to matched
          setTimeout(() => {
            this[sideKey][index].matched = true;
            this[otherSideKey][index].matched = true;
            this.selectedIndex[otherSideKey] = undefined;
            this.selectedIndex[sideKey] = undefined;
          }, 600);
        }
      },

      bothSidesSelected: function() {
        return [Side.LEFT, Side.RIGHT]
          .map(side => this.selectedIndex[side])
          .every(selectIndex => (selectIndex !== undefined));
      },

      arrayMoveElement: function(arr, fromIndex, toIndex) {
        const element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
      },

      addPosition: function(el, index) {
        el.position = index;
        return el;
      },

      leave: function(el, done) {
        console.log('leave', el);
        done();
      },

      enter: function(el) {
        console.log('enter', el);
      }
    },

    watch: {
      /**
       * Generates shuffled right and left lists
       * @param {Pair[]} pairs
       */
      pairs: function(pairs) {
        this[Side.LEFT] = shuffle(pairs.map(pair => pair.left)).map(this.addPosition);
        this[Side.RIGHT] = shuffle(pairs.map(pair => pair.right)).map(this.addPosition);


        this.$refs.left.list = shuffle(pairs.map(pair => pair.left)).map(this.addPosition);
      }
    }
  }
</script>

<style lang="scss"  type="text/scss">
  $width-component: 600px;
  $width-selected-displacement: 40px;
  $border-radius-element: 10px;

  .h5p-combine-pairs {

    .h5p-pair-list {
      width: 400px;
      height: 400px;
    }

    .h5p-pair-list-left {
      background-color: lightblue;
      float: left;
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
      float: left;

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

    .h5p-element {
      width: 150px;
      margin: 10px;
      padding: 10px;
      display: block;
      background-color: blue;
      color: white;
      transition: all .2s ease-in;
    }

    .h5p-element-selected {
      background-color: orange;
    }

    .h5p-element-matched {
      background-color: gray;
    }
  }
</style>