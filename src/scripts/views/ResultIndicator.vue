<template>
  <div class="h5p-indicator" :title="titles[state]" :class="stateClass(state)"></div>
</template>
<script>
  import pairState from '../components/pair-state';

  export default {
    props: ['state', 'i18n'],
    data: () => ({
      titles: {}
    }),
    methods: {
      stateClass: function(state) {
        if(state) {
          return `h5p-indicator-${state}`
        }
      }
    },

    mounted: function() {
      this.titles = {
        [pairState.SUCCESS]: this.i18n.correct,
        [pairState.FAILURE]: this.i18n.incorrect,
        [pairState.SHOW_SOLUTION]: this.i18n.correctSolution
      }
    }
  };
</script>
<style lang="scss"  type="text/scss">
  $indicator-diameter: 2.5em;

  @mixin result-indicator($border-color, $background-color, $content) {
    background-color: $background-color;
    border-color: $border-color;

    &:before {
      content: $content;
    }
  }

  .h5p-matching {
    .h5p-indicator {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translate(50%, -50%);
      z-index: 2;
      width: $indicator-diameter;
      height: $indicator-diameter;
      line-height: $indicator-diameter;
      text-align: center;
      border-radius: 50%;
      border: 0.3em solid;
      color: white;

      &:before {
        font-family: 'H5PFontAwesome4';
        font-size: 1.5em;
      }

      &.h5p-indicator-success {
        @include result-indicator(#50c9a8, #3ea98b, "\f00c");
      }

      &.h5p-indicator-failure {
        @include result-indicator(#e54b55, #da1b44, "\f00d");
      }

      &.h5p-indicator-show-solution {
        @include result-indicator(#4c93e5, #1b72db, "\f00d");
      }
    }
  }
</style>