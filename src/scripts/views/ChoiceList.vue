<template>
  <draggable
      :list="list"
      @end="onDragEnd"
      :move="onMove"
      :options="{ group:'choices', sort: false }"
      :class="['h5p-matching-draggables', 'h5p-matching-draggables-' + choiceType]">
    <!-- Ordered list of choices-->
    <transition-group
        name="pair-list"
        tag="ol"
        class="h5p-choice-list unstyled-list"
        :class="['h5p-' + choiceType + '-choice-list' , 'h5p-choice-list-' + listName]">

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
            v-bind:droppable="droppableIndex === index"
            v-bind:listName="listName"
            v-bind:otherChoice="otherList[index]"
            v-bind:i18n="i18n"
            v-bind:title="element.title"
            @select="select(index)">
            {{element.title}}
        </text-choice>

        <!-- Image based choice button -->
        <image-choice
            v-if="choiceType === 'image'"
            v-bind:selected="index === selectedIndex"
            v-bind:listName="listName"
            v-bind:state="element.state"
            v-bind:droppable="droppableIndex === index"
            v-bind:imagePath="element.imagePath"
            v-bind:title="element.title"
            v-bind:otherChoice="otherList[index]"
            v-bind:i18n="i18n"
            @select="select(index)">
        </image-choice>

        <!-- The result indicator (only shown on the source side)-->
        <result-indicator
            ref="resultIndicators"
            v-bind:i18n="i18n"
            v-bind:state="element.state"
            v-show="listName === 'source' && showSuccessIndicator(element.state)">
        </result-indicator>
      </li>
    </transition-group>
  </draggable>
</template>

<script>
  import { __, contains, findIndex, map, prop, propEq } from 'ramda';
  import Vue from 'vue';
  import pairState from '../components/pair-state';
  import choiceListName from '../components/choice-list-name';
  import draggable from 'vuedraggable'
  import textChoice from './TextChoice.vue';
  import imageChoice from './ImageChoice.vue';
  import resultIndicator from './ResultIndicator.vue';

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
    props: ['listName', 'choiceType', 'i18n', 'otherList'],
    components: {
      draggable,
      textChoice,
      imageChoice,
      resultIndicator
    },
    data: () => ({
      list: [],
      selectedIndex: NO_SELECTION,
      droppableIndex: NO_SELECTION,
      draggableList: []
    }),

    methods: {
      select: function (index) {
        const alreadySelected = (this.selectedIndex === index);
        this.selectedIndex = alreadySelected ? NO_SELECTION : index;
        this.$emit('select', this.selectedIndex);
      },

      onMove: function (event) {
        this.$emit('draggable', {
          index: event.draggedContext.index,
          otherIndex: event.relatedContext.index
        });

        return false;
      },

      onDragEnd: function (event) {
        this.$emit('dragEnd', {
          index: event.newIndex
        });
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

    .h5p-matching-draggables-text {
      width: 100%;
    }
  }
</style>