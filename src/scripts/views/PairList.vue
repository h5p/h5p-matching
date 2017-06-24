<template>
  <transition-group name="pair-list" tag="ul" class="h5p-pair-list h5p-pair-list-left unstyled-list" :class="listClass">
    <li
        v-for="(element, index) in list"
        v-bind:key="element.position"
        v-bind:data-index="index"
        class="h5p-element"
        tabindex="0"
        :class="{ 'h5p-element-matched' : element.matched, 'h5p-element-selected' : (index === selectedIndex)}"
        @click="select(index)">
      {{element.title}}</li>
  </transition-group>
</template>

<script>
  import { mixin as focusMixin }  from 'vue-focus';
  const NO_SELECTION = undefined;

  export default {
    mixins: [ focusMixin ],
    props: ['listClass'],
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

      hasSelected: function() {
        return this.selectedIndex !== NO_SELECTION;
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

      moveDown: function() {
        this.focused = Math.min(this.focused + 1, this.items.length - 1);
      },

      moveUp: function() {
        this.focused = Math.max(this.focused - 1, 0);
      },
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
  }

  .h5p-element-selected {
    background-color: orange;
  }

  .h5p-element-matched {
    background-color: gray;
  }
</style>