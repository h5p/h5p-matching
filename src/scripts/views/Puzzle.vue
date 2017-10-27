<template>
  <div :class="puzzleClasses" v-html="images[choiceListName]"></div>
</template>
<script>
  import choiceListName from '../components/choice-list-name';
  import imagePuzzleLeft from '../../images/puzzle-left.svg';
  import imagePuzzleRight from '../../images/puzzle-right.svg';

  export default {
    props: ['choiceListName', 'matchCompleted'],

    data: () => ({
      images: {
        [choiceListName.SOURCE]: imagePuzzleLeft,
        [choiceListName.TARGET]: imagePuzzleRight
      }
    }),

    computed: {
      puzzleClasses: function() {
        return {
          'h5p-puzzle': true,
          [`h5p-puzzle-${this.choiceListName}`]: true,
          'h5p-puzzle-match-completed': this.matchCompleted
        };
      }
    }
  };
</script>
<style lang="scss"  type="text/scss">
  @import '../../styles/variables';

  .h5p-choice {
    position: relative;

    .h5p-puzzle {
      position: absolute;
      top: -0.083em;
      width: auto;
      height: 1em + ($choice-padding * 2);

      svg {
        height: 100%;
      }
    }

    .h5p-puzzle-source {
      right: -0.083em;

      &.h5p-puzzle-match-completed .st0 {
        fill: transparent;
      }
    }

    .h5p-puzzle-target {
      left: -0.083em;

      &.h5p-puzzle-match-completed {
        display: none;
      }
    }
  }
</style>