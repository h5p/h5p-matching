<template>
  <div
      role="button"
      class="h5p-choice h5p-text-choice"
      :class="[{'h5p-choice-selected  ' : selected}, 'h5p-choice-' + state]"
      :aria-label="ariaLabel()"
      :title="hasOverflow() ? title : null"
      v-keyboard.sort="listName"
      @click="select"
      @keyup.enter="select"
      @keyup.space="select">
    <div class="h5p-choice-title">
      <slot></slot>
    </div>
    <puzzle :choiceListName="listName"></puzzle>
  </div>
</template>
<script>
  import Vue from 'vue'
  import pairState from '../components/pair-state';
  import { forEachObjIndexed, invoker, lt, or } from 'ramda';

  /**
   * Calls compareDocumentPosition on two elements
   *
   * @param {Element} a
   * @param {Element} b
   * @return {number}
   */
  const compareDocumentPosition = invoker(1, 'compareDocumentPosition');

  /**
   * Returns true if the element has overflow
   * @param element
   */
  const hasOverflow = element => or(
    lt(element.clientWidth, element.scrollWidth),
    lt(element.clientHeight, element.scrollHeight)
  );

  /**
   * Configuration
   */
  export default {
    props: ['title', 'selected','state', 'listName', 'i18n', 'otherChoice'],

    data: () => ({
      labels: {}
    }),

    methods: {
      /**
       * Triggers the 'selcet' event
       */
      select: function() {
        this.$emit('select')
      },

      /**
       * Returns the aria-label for this choice
       */
      ariaLabel: function() {
        if (this.labels[this.state]) {
          return this.labels[this.state]
            .replace('@title', this.title)
            .replace('@oppositeTitle', this.otherChoice.title);
        }
      },

      hasOverflow: function(){
        return this.$el && hasOverflow(this.$el.querySelector('.h5p-choice-title'));
      }
    },

    mounted: function() {
      this.labels = {
        [pairState.NONE]: this.i18n.choiceUnMatched,
        [pairState.MATCHED]: this.i18n.choiceMatched,
        [pairState.SUCCESS]: `${this.i18n.choiceMatched}. ${this.i18n.correct}`,
        [pairState.FAILURE]: `${this.i18n.choiceMatched}. ${this.i18n.incorrect}`,
        [pairState.SHOW_SOLUTION]: this.i18n.choiceShouldBeMatched
      };
    }
  };
</script>
<style lang="scss"  type="text/scss">
  @import '../../styles/variables';
  @import '../../styles/mixins';

  @mixin choice-colors($border-color, $background-color1, $background-color2, $puzzle-fill, $color: white) {
    @include linear-gradient($background-color1, $background-color2);
    background-origin: border-box;
    border: 0.083em solid $border-color;
    color: $color;

    .puzzle-inner {
      fill: url($puzzle-fill);
    }

    .puzzle-border {
      fill: $border-color;
    }
  }

  .h5p-matching {
    .h5p-text-choice {
      @include choice-colors(#bbd8ea, #f1fbfd, #e3f1f4, #puzzle-none, #353533);
      width: $choice-width;
      display: block;
      font-size: 1.042em;
      height: 1em + ($choice-padding * 2);
      padding-left: $choice-padding;
      padding-right: $choice-padding;
      margin-bottom: 0.667em;
      transition: transform .2s ease-in, padding .2s ease-in;
      box-sizing: border-box;
      text-align: left;

      &:hover {
        @include choice-colors(#e6c6dd, #f9edf7, #f2e2ef, #puzzle-hover, #353533);
      }

      &.h5p-choice-none,
      &.h5p-choice-matched {
        cursor: pointer;
      }

      &.h5p-choice-matched,
      &.h5p-choice-selected,
      &.h5p-choice-show-solution {
        @include choice-colors(#1c74cd, #4c93e5, #1b72db, #puzzle-matched);
      }

      &.h5p-choice-success {
        @include choice-colors(#3ca587, #50c9a8, #3ea98b, #puzzle-success);
      }

      &.h5p-choice-failure {
        @include choice-colors(#cb183f, #e54b55, #da1b44, #puzzle-failure);
      }
    }

    .h5p-choice-title {
      @include vertical-align();
      max-height: 2.6em;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
  }
</style>