<template>
  <transition-group name="pair-list" tag="ul" class="h5p-choice-list unstyled-list" :class="listClass">
    <li v-for="(element, index) in list" v-bind:key="element.position" v-bind:data-index="index">
      <choice
          v-bind:selected="index === selectedIndex"
          v-bind:state="element.state"
          @select="select(index)">
          {{element.title}}
      </choice>
      <result-indicator v-bind:state="element.state" v-show="showSuccessIndicator(element.state)"></result-indicator>
    </li>
  </transition-group>
</template>

<script>
  import { contains, prop, propEq, findIndex } from 'ramda';
  import Vue from 'vue';
  import pairState from '../components/pair-state';
  const NO_SELECTION = undefined;

  export default {
    props: ['listClass', 'name'],
    data: () => ({
      list: [],
      selectedIndex: NO_SELECTION
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

      getState: function(index) {
        return prop('state', this.list[index]);
      },

      setSelectedChoiceState: function(state) {
        this.setState(this.selectedIndex, state)
      },

      getSelectedChoiceState: function() {
        return this.getState(this.selectedIndex);
      },

      hasSelected: function() {
        return this.selectedIndex !== NO_SELECTION;
      },

      getSelectedIndex: function() {
        return this.selectedIndex;
      },

      getIndexPairKey: function (pairKey) {
        return findIndex(propEq('pairKey', pairKey), this.list);
      },

      getSelected: function() {
        if(this.selectedIndex !== NO_SELECTION) {
          return this.list[this.selectedIndex];
        }
      },

      showSuccessIndicator: function(state) {
        return this.name === 'left' && contains(state, [pairState.SUCCESS, pairState.FAILURE, pairState.SHOW_SOLUTION]);
      }
    }
  }
</script>
<style lang="scss"  type="text/scss">
  .h5p-combine-pairs {
    .h5p-choice-list li {
      position: relative;
      transition: transform .2s ease-in;
    }
  }
</style>