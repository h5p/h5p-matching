<template>
  <transition-group name="pair-list" tag="ul" class="h5p-pair-list h5p-pair-list-left unstyled-list" :class="listClass">
    <li
        v-for="(element, index) in list"
        v-bind:key="element.position"
        v-bind:data-index="index"
        class="h5p-element"
        v-keyboard="name"
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

      switchElementPlaces: function(fromIndex, toIndex) {
        const element = this.list[fromIndex];
        this.list[fromIndex] = this.list[toIndex];
        this.list[toIndex] = element;
      },

      stateClass: function(element) {
        return `h5p-element-${element.state}`;
      }
    }
  }
</script>

<style lang="scss"  type="text/scss">
  .h5p-pair-list {
    width: 400px;
    background-color: lightblue;
    display: inline-block;
  }

  .h5p-element {
    width: 150px;
    margin: 10px;
    padding: 10px;
    display: block;
    background-color: blue;
    color: white;
    transition: all .2s ease-in;

    &:focus {
      background-color: cornflowerblue;
    }
  }

  .h5p-element-selected {
    background-color: orange;
  }

  .h5p-element-matched {
    background-color: gray;
  }
</style>