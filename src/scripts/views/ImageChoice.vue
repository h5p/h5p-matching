<template>
  <div
      role="button"
      class="h5p-choice h5p-image-choice"
      :class="[{'h5p-choice-selected  ' : selected}, 'h5p-choice-' + state]"
      :aria-label="ariaLabel()"
      v-keyboard.sort="keyboardListName"
      @keyup.enter="select"
      @keyup.space="select"
      @click="select">
    <img v-bind:src="image" v-bind:alt="title" />
  </div>
</template>
<script>
  import pairState from '../components/pair-state';

  export default {
    props: ['selected','state', 'image', 'title', 'oppositeAnswer', 'i18n', 'keyboardListName'],
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
            .replace('@oppositeTitle', this.oppositeAnswer);
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
    cursor: pointer;
    overflow: hidden;
    padding-right: $choice-padding;

    img {
      max-height: 100%;
      margin-left: auto;
      margin-right: auto;
    }

    &:hover {
      border-color: #e6c6dd;
    }

    &.h5p-choice-matched,
    &.h5p-choice-selected,
    &.h5p-choice-show-solution {
      border-color: #1c74cd;
    }

    &.h5p-choice-success {
      border-color: #3ca587;
    }

    &.h5p-choice-failure {
      border-color: #cb183f;
    }
  }
</style>