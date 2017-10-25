<template>
  <div
      class="h5p-choice h5p-image-choice"
      :class="[{'h5p-choice-selected  ' : selected}, 'h5p-choice-' + state]"
      @click="select">
    <img v-bind:src="image" v-bind:alt="alt" />
  </div>
</template>
<script>
  export default {
    props: ['selected','state', 'image', 'alt'],
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