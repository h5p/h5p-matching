<template>
  <div
      role="button"
      class="h5p-choice h5p-image-choice"
      :class="[{'h5p-choice-selected  ' : selected}, 'h5p-choice-' + state]"
      :aria-label="ariaLabel()"
      :aria-dropeffect="droppable ? 'execute' : undefined"
      v-keyboard.sort="listName"
      @keyup.enter="select"
      @keyup.space="select"
      @click="select">
    <div class="h5p-image-choice-image">
      <img v-bind:src="imagePath" v-bind:alt="title" />
    </div>
    <puzzle listName="source"></puzzle>
  </div>
</template>
<script>
  import PuzzleView from './Puzzle.vue';
  import pairState from '../components/pair-state';
  import KeyboardMixin from '../mixins/keyboard';

  export default {
    props: ['selected', 'state', 'imagePath', 'title', 'otherChoice', 'i18n', 'listName', 'droppable'],
    components: { puzzle: PuzzleView },
    mixins: [KeyboardMixin],
    data: () => ({
      labels: {}
    }),

    methods: {
      select: function() {
        this.$emit('select')
      },

      /**
       * Returns the aria-label for this choice
       */
      ariaLabel: function() {
        if(this.labels[this.state]) {
          return this.labels[this.state]
            .replace('@title', this.title)
            .replace('@oppositeTitle', this.otherChoice.title);
        }
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

  @mixin image-choice-colors($border-color) {
    border: 0.083em solid $border-color;

    .puzzle-border {
      fill: $border-color;
    }
  }

  .h5p-matching {
    .h5p-image-choice {
      border: 0.083em solid #bbd8ea;
      width: $choice-width;
      height: 1em + ($choice-padding * 2);
      display: block;
      font-size: 1.042em;
      margin-bottom: 0.667em;
      transition: transform .2s ease-in, padding .2s ease-in;
      box-sizing: border-box;
      text-align: left;
      padding-right: $choice-padding;

      .puzzle-inner {
        fill: white;
      }

      .puzzle-border {
        fill: #bbd8ea;
      }

      &.h5p-choice-none,
      &.h5p-choice-matched {
        cursor: pointer;
      }

      .h5p-image-choice-image {
        overflow: hidden;
        border-radius: $border-radius-choice 0 0 $border-radius-choice;
        box-sizing: border-box;
        height: 100%;
        max-width: 100%;
      }

      img {
        max-height: 100%;
        margin-left: auto;
        margin-right: auto;
      }

      &.h5p-choice-matched,
      &.h5p-choice-selected,
      &.h5p-choice-show-solution {
        @include image-choice-colors(#1c74cd);
      }

      &.h5p-choice-success {
        @include image-choice-colors(#3ca587);
      }

      &.h5p-choice-failure {
        @include image-choice-colors(#cb183f);
      }
    }
  }
</style>