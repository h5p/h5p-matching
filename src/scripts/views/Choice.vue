<template>

</template>
<script>
  export default {
    data: () => ({})
  };
</script>
<style lang="scss"  type="text/scss">
  @import '../../styles/variables';
  @import '../../styles/mixins';

  @mixin choice-colors($border-color, $background-color1, $background-color2, $color: white) {
    @include linear-gradient($background-color1, $background-color2);
    border: 1px solid $border-color;
    color: $color;
  }

  .h5p-choice {
    @include choice-colors(#bbd8ea, #f1fbfd, #e3f1f4, #353533);
    width: calc(100% - #{$element-displacement});
    display: block;
    padding: 1.7em;
    margin-bottom: 1em;
    transition: all .2s ease-in;
    box-sizing: border-box;
  }

  .h5p-element:hover {
    @include choice-colors(#e6c6dd, #f9edf7, #f2e2ef, #353533);
  }

  .h5p-element.h5p-element-matched,
  .h5p-element.h5p-element-selected {
    @include choice-colors(#1c74cd, #4c93e5, #1b72db);
  }

  .h5p-element.h5p-element-success {
    @include choice-colors(#3ca587, #50c9a8, #3ea98b);
  }

  .h5p-element.h5p-element-failure {
    @include choice-colors(#cb183f, #e54b55, #da1b44);
  }
</style>