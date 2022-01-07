<script>
import { formatDate } from '~/utils/formatDate'

export default {
  computed: {
    formatedDate () {
      const date = {weekday:'Среда', day:'17', month: "февр."}
      return `${date.weekday}, ${date.day} ${date.month}`
    },

    isToday () {
      return this.$day().isSame(this.$store.state.trnForm.values.date, 'day')
    }
  },

  methods: {
    setPrevDay () {
    },
    setNextDay () {
      if (!this.isToday) {
      }
    }
  }
}
</script>

<template lang="pug">
.walletFormMeta
  .walletFormMeta__date
    .walletFormDate
      .walletFormDate__item._icon(@click="setPrevDay()"): .mdi.mdi-chevron-left
      .walletFormDate__item(@click="showEndingBalanceDate = true") {{ formatedDate }}
      .walletFormDate__item._icon(:class="{ _disable: isToday }" @click="setNextDay()"):  .mdi.mdi-chevron-right
    .inputText__label {{ $t('wallets.form.reconciledDate.label') }}
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"

.walletFormMeta
  display flex
  align-items stretch
  border-top 1px solid var(--c-bg-3)

  @media $media-laptop
    color var(--c-font-4)
    background var(--c-bg-4)
    border-top 0

  &__date
    flex-grow 1

    &:hover
      @media $media-laptop
        background var(--c-bg-5)

    &:active
      background var(--c-bg-5)

    &._active
      color var(--c-font-1)

.walletFormDate
  display flex
  align-items center
  flex-grow 1
  height 100%
  font-weight 500
  text-align center

  &__item
    display flex
    align-items center
    justify-content center
    flex-grow 1
    height 100%

    &:hover
      @media $media-laptop
        background var(--c-bg-5)

    &:active
      background var(--c-bg-5)

    &._icon
      color var(--c-font-4)
      font-size 28px

    &._disable
      opacity .4

      &:hover
      &:active
        background none

</style>
