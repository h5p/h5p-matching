<template>
  <!-- Ordered list of choices-->
  <transition-group
      name="pair-list"
      tag="ol"
      class="h5p-choice-list unstyled-list"
      :class="['h5p-' + choiceType + '-choice-list' ,listClass]">

    <!-- List item to move vertically-->
    <li
        v-for="(element, index) in list"
        v-bind:key="element.position"
        v-bind:data-index="index">

      <!-- Text based choice button -->
      <text-choice
          v-if="choiceType !== 'image'"
          v-bind:selected="index === selectedIndex"
          v-bind:state="element.state"
          v-bind:keyboardListName="name"
          v-bind:oppositeAnswer="oppositeAnswers[index]"
          v-bind:i18n="i18n"
          v-bind:title="element.title"
          @select="select(index)">
          {{element.title}}
      </text-choice>

      <!-- Image based choice button -->
      <image-choice
          v-if="choiceType === 'image'"
          v-bind:selected="index === selectedIndex"
          v-bind:keyboardListName="name"
          v-bind:state="element.state"
          v-bind:image="element.image"
          v-bind:title="element.title"
          v-bind:oppositeAnswer="oppositeAnswers[index]"
          v-bind:i18n="i18n"
          @select="select(index)">
      </image-choice>

      <!-- The result indicator (only shown on the source side)-->
      <result-indicator
          ref="resultIndicators"
          v-bind:i18n="i18n"
          v-bind:state="element.state"
          v-show="name === 'source' && showSuccessIndicator(element.state)">
      </result-indicator>
    </li>
  </transition-group>
</template>

<script>
  import { __, contains, findIndex, map, prop, propEq } from 'ramda';
  import Vue from 'vue';
  import pairState from '../components/pair-state';
  import choiceListName from '../components/choice-list-name';
  const NO_SELECTION = undefined;

  /**
   * Returns an ordered list of the ids
   * @function
   * @param {Choice[]} choiceList
   * @return {string[]}
   */
  const getAllIds = map(prop('id'));

  /**
   * Returns an ordered list of the states
   * @function
   * @param {Choice[]} choiceList
   * @return {string[]}
   */
  const getAllStates = map(prop('state'));

  /**
   * Configuration
   */
  export default {
    props: ['listClass', 'name', 'choiceType', 'i18n', 'oppositeAnswers'],
    data: () => ({
      list: [],
      selectedIndex: NO_SELECTION
    }),

    methods: {
      select: function (index) {
        const alreadySelected = (this.selectedIndex === index);
        this.selectedIndex = alreadySelected ? NO_SELECTION : index;
        this.$emit('select', this.selectedIndex);
      },

      setState: function (index, state) {
        const element = Object.assign({}, this.list[index], {state});
        Vue.set(this.list, index, element);
      },

      getState: function (index) {
        return prop('state', this.list[index]);
      },

      setSelectedChoiceState: function (state) {
        this.setState(this.selectedIndex, state)
      },

      hasSelected: function () {
        return this.selectedIndex !== NO_SELECTION;
      },

      getSelectedIndex: function () {
        return this.selectedIndex;
      },

      getIndexById: function (id) {
        return findIndex(propEq('id', id), this.list);
      },

      unsetSelectedIndex: function () {
        this.selectedIndex = NO_SELECTION;
      },

      showSuccessIndicator: contains(__, [pairState.SUCCESS, pairState.FAILURE, pairState.SHOW_SOLUTION]),

      getCurrentState: function () {
        return {
          states: getAllStates(this.list),
          ids: getAllIds(this.list),
        };
      }
    }
  }
</script>
<style lang="scss"  type="text/scss">
  .h5p-matching {
    .h5p-choice-list {
      li {
        position: relative;
        transition: transform .2s ease-in;
      }
    }
  }
</style>