<template>
  <transition-group
      name="pair-list"
      tag="ol"
      class="h5p-choice-list unstyled-list"
      :class="['h5p-' + choiceType + '-choice-list' ,listClass]">
    <li
        v-for="(element, index) in list"
        v-bind:key="element.position"
        v-bind:data-index="index"
        @transitionend="transitionEnd(element, index)">
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

      <result-indicator ref="resultIndicators" v-bind:i18n="i18n" v-bind:state="element.state" v-show="showSuccessIndicator(element.state)"></result-indicator>
    </li>
  </transition-group>
</template>

<script>
  import { contains, findIndex, map, prop, propEq } from 'ramda';
  import Vue from 'vue';
  import pairState from '../components/pair-state';
  import choiceListName from '../components/choice-list-name';
  const NO_SELECTION = undefined;

  const getIds = map(prop('id'));
  const getStates = map(prop('state'));

  export default {
    props: ['listClass', 'name', 'choiceType', 'i18n', 'oppositeAnswers'],
    data: () => ({
      list: [],
      selectedIndex: NO_SELECTION
    }),

    methods: {
      transitionEnd: function(choice, index) {
        if(choice.state !== pairState.NONE) {
          this.$emit('matchAnimationCompleted', { choice, index });
        }
      },
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

      showSuccessIndicator: function (state) {
        return this.name === choiceListName.SOURCE
          && contains(state, [pairState.SUCCESS, pairState.FAILURE, pairState.SHOW_SOLUTION]);
      },

      getCurrentState: function () {
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
    .h5p-choice-list {
      li {
        position: relative;
        transition: transform .2s ease-in;
      }
    }
  }
</style>