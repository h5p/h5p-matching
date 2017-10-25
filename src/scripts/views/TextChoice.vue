<template>
  <div
      role="button"
      tabindex="0"
      class="h5p-choice h5p-text-choice"
      :class="[{'h5p-choice-selected  ' : selected}, 'h5p-choice-' + state]"
      @click="select"
      @keyup.enter="select"
      @keyup.space="select">
    <div class="h5p-choice-title">
      <slot></slot>
    </div>
  </div>
</template>
<script>
  export default {
    props: ['selected','state'],
    methods: {
      select: function() {
        this.$emit('select')
      }
    }
  };
</script>
<style lang="scss"  type="text/scss">
  @import '../../styles/variables';
  @import '../../styles/mixins';

  @mixin choice-colors($border-color, $background-color1, $background-color2, $color: white) {
    @include linear-gradient($background-color1, $background-color2);
    border: 0.083em solid $border-color;
    color: $color;
  }

  .h5p-text-choice {
    @include choice-colors(#bbd8ea, #f1fbfd, #e3f1f4, #353533);
    width: calc(100% - #{$element-displacement});
    display: block;
    font-size: 1.042em;
    height: 1em + ($choice-padding * 2);
    padding-left: $choice-padding;
    padding-right: $choice-padding;
    margin-bottom: 0.667em;
    transition: transform .2s ease-in, padding .2s ease-in;
    box-sizing: border-box;
    text-align: left;
    cursor: pointer;

    &:hover {
      @include choice-colors(#e6c6dd, #f9edf7, #f2e2ef, #353533);
    }

    &.h5p-choice-matched,
    &.h5p-choice-selected,
    &.h5p-choice-show-solution {
      @include choice-colors(#1c74cd, #4c93e5, #1b72db);
    }

    &.h5p-choice-success {
      @include choice-colors(#3ca587, #50c9a8, #3ea98b);
    }

    &.h5p-choice-failure {
      @include choice-colors(#cb183f, #e54b55, #da1b44);
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
</style>