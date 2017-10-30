<template>
  <div :class="puzzleClasses" v-html="images[listName]"></div>
</template>
<script>
  import choiceListName from '../components/choice-list-name';
  import imagePuzzleLeft from '../../images/puzzle-left.svg';
  import imagePuzzleRight from '../../images/puzzle-right.svg';

  export default {
    props: ['listName'],

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
          [`h5p-puzzle-${this.listName}`]: true
        };
      }
    }
  };
</script>
<style lang="scss"  type="text/scss">
  @import '../../styles/variables';

  .h5p-matching {
    .h5p-choice {
      position: relative;

      .h5p-puzzle {
        position: absolute;
        top: -0.083em;
        width: 0.55em;
        height: 1em + ($choice-padding * 2);

        svg {
          height: 100%;
        }
      }
    }

    .h5p-choice-list-source .h5p-choice {
      background-repeat: no-repeat;
      background-size: calc(100% - 8px) 100%;
      background-origin: border-box;
      // border-right: 0;

      .h5p-puzzle {
        right: 0;
      }
    }

    .h5p-puzzle-target {
      left: 0;
      transform: translateX(-100%);
    }
  }
</style>