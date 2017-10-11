<template>
  <div class="h5p-indicator" :class="stateClass(state)"></div>
</template>
<script>
  export default {
    props: ['state'],
    data: () => ({}),
    methods: {
      stateClass: function(state) {
        if(state) {
          return `h5p-indicator-${state}`
        }
      }
    }
  };
</script>
<style lang="scss"  type="text/scss">
  $indicator-diameter: 2.5em;

  .h5p-combine-pairs {
    .h5p-indicator {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translate(50%, -50%);
      z-index: 1;
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
        background-color: #3ea98b;
        border-color: #50c9a8;

        &:before {
          content: "\f00c";
        }
      }

      &.h5p-indicator-failure {
        background-color: #da1b44;
        border-color: #e54b55;

        &:before {
          content: "\f00d";
        }
      }
    }
  }
</style>