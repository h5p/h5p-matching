<template>
  <transition-group name="pair-list" tag="ul" class="h5p-pair-list h5p-pair-list-left unstyled-list" :class="listClass">
    <li
        v-for="(element, index) in list"
        v-bind:key="element.position"
        v-bind:data-index="index"
        class="h5p-element"
        :class="[{'h5p-element-selected' : (index === selectedIndex)}, stateClass(element)]"
        @click="select(index)">
      {{element.title}}</li>
  </transition-group>
</template>

<script>
  import Vue from 'vue';
  import keyboardMixin  from '../mixins/keyboard-directive';
  const NO_SELECTION = undefined;

  export default {
    mixins: [ keyboardMixin ],
    props: ['listClass', 'name'],
    data: () => ({
      list: [],
      selectedIndex: NO_SELECTION,
      focusedIndex: undefined
    }),

    methods: {
      select: function(index) {
        const alreadySelected = (this.selectedIndex === index);
        this.selectedIndex = alreadySelected ? NO_SELECTION : index;
        this.$emit('select', this.selectedIndex);
      },

      setState: function(index, state){
        const element = Object.assign({}, this.list[index], { state });
        Vue.set(this.list, index, element);
      },

      hasSelected: function() {
        return this.selectedIndex !== NO_SELECTION;
      },

      getSelectedIndex: function() {
        return this.selectedIndex;
      },

      getSelected: function() {
        if(this.selectedIndex !== NO_SELECTION) {
          return this.list[this.selectedIndex];
        }
      },

      stateClass: function(element) {
        return `h5p-element-${element.state}`;
      }
    }
  }
</script>

<style lang="scss"  type="text/scss">
  @import '../../styles/variables';
  @import '../../styles/mixins';
  @import '../../styles/colors';

  @mixin listElement($border-color, $background-color1, $background-color2, $color: white) {
    @include linear-gradient($background-color1, $background-color2);
    border: 1px solid $border-color;
    color: $color;
  }

  .h5p-element {
    @include listElement(#bbd8ea, #f1fbfd, #e3f1f4, #353533);
    width: calc(100% - #{$element-displacement});
    display: block;
    padding: 1.7em;
    margin-bottom: 1em;
    transition: all .2s ease-in;
    box-sizing: border-box;

    &:hover {
      @include listElement(#e6c6dd, #f9edf7, #f2e2ef, #353533);
    }
  }

  .h5p-element.h5p-element-matched,
  .h5p-element.h5p-element-selected {
    @include listElement(#1c74cd, #4c93e5, #1b72db);
  }

  .h5p-element.h5p-element-success {
    @include listElement(#3ca587, #50c9a8, #3ea98b);
  }

  .h5p-element.h5p-element-failure {
    @include listElement(#cb183f, #e54b55, #da1b44);
  }
</style>