<template>
  <transition-group name="pair-list" tag="ul" class="h5p-pair-list h5p-pair-list-left unstyled-list">
    <li
        v-for="(element, index) in list"
        v-bind:key="element.position"
        v-bind:data-index="index"
        class="h5p-element"
        :class="{ 'h5p-element-matched' : element.matched, 'h5p-element-selected' : (index === selectedIndex)}"
        tabindex="0"
        @click="selectedIndex=index">
      {{element.title}}</li>
  </transition-group>
</template>

<script>
  export default {
    props: ['selectedIndex'],

    data: () => ({
      list: []
    })
  }
</script>

<style lang="scss"  type="text/scss">

</style>