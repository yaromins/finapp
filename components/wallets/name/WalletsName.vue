<script>
export default {
    props: {
        name: {
            type: String,
            required: true
        },
        tooltip: {
            type: String,
            required: false
        },
    }
}
</script>

<template lang="pug">
.walletsName()
    .walletsName__name {{ name }}
    .walletsName__tooltip(v-if="tooltip > ''") {{ tooltip }}
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.walletsName
  display flex
  align-items start
  justify-content center

  &__name
    flex 1 0 0
    align-self start
    justify-self start

  &__tooltip
    opacity .6
    padding-right 0
    font-size 12px
    text-align center
</style>