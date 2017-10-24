<template>
  <transition-group name="pair-list" tag="ul" class="h5p-choice-list unstyled-list" :class="['h5p-' + choiceType + '-choice-list' ,listClass]">
    <li v-for="(element, index) in list" v-bind:key="element.position" v-bind:data-index="index">
      <text-choice
          v-if="choiceType !== 'image'"
          v-bind:selected="index === selectedIndex"
          v-bind:state="element.state"
          @select="select(index)">
          {{element.title}}
      </text-choice>

      <image-choice
          v-if="choiceType === 'image'"
          v-bind:selected="index === selectedIndex"
          v-bind:state="element.state"
          v-bind:image="element.image"
          v-bind:alt="element.title"
          @select="select(index)">
      </image-choice>

      <result-indicator v-bind:state="element.state" v-show="showSuccessIndicator(element.state)"></result-indicator>
    </li>
  </transition-group>
</template>

<script>
  import { contains, findIndex, map, prop, propEq } from 'ramda';
  import Vue from 'vue';
  import pairState from '../components/pair-state';
  const NO_SELECTION = undefined;

  export default {
    props: ['listClass', 'name', 'choiceType'],
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

      getIndexById: function (id) {
        return findIndex(propEq('id', id), this.list);
      },

      getSelected: function() {
        if(this.selectedIndex !== NO_SELECTION) {
          return this.list[this.selectedIndex];
        }
      },

      unsetSelectedIndex: function(){
        this.selectedIndex = NO_SELECTION;
      },

      showSuccessIndicator: function(state) {
        return this.name === 'left' && contains(state, [pairState.SUCCESS, pairState.FAILURE, pairState.SHOW_SOLUTION]);
      },

      getCurrentState: function() {
        const getIds = map(prop('id'));
        const getStates = map(prop('state'));

        return {
          states: getStates(this.list),
          ids: getIds(this.list),
        };
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