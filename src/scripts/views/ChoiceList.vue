<template>
  <transition-group name="pair-list" tag="ul" class="h5p-choice-list unstyled-list" :class="listClass">
    <li v-for="(element, index) in list" v-bind:key="element.position" v-bind:data-index="index">
      <choice
          v-bind:selected="index === selectedIndex"
          v-bind:state="element.state"
          @select="select(index)">
          {{element.title}}
      </choice>
    </li>
  </transition-group>
</template>

<script>
  import Vue from 'vue';
  const NO_SELECTION = undefined;

  export default {
    props: ['listClass', 'name'],
    data: () => ({
      list: [],
      selectedIndex: NO_SELECTION
    }),

    methods: {
      select: function(index) {
        const alreadySelected = (this.selectedIndex === index);
        this.selectedIndex = alreadySelected ? NO_SELECTION : index;
        this.$emit('select', this.selectedIndex);
      },

      setState: function(index, state){
        const element = Object.assign({}, this.list[index], { state });
        Vue.set(this.list, index, element);
      },

      hasSelected: function() {
        return this.selectedIndex !== NO_SELECTION;
      },

      getSelectedIndex: function() {
        return this.selectedIndex;
      },

      getSelected: function() {
        if(this.selectedIndex !== NO_SELECTION) {
          return this.list[this.selectedIndex];
        }
      }
    }
  }
</script>
<style lang="scss"  type="text/scss">
  .h5p-combine-pairs {
    .h5p-choice-list li {
      transition: all .2s ease-in;
    }
  }
</style>