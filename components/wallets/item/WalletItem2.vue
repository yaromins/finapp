<script>
export default {
  name: 'WalletItem2',

  props: {
    id: {
      type: String,
      required: true
    },

    showBase: {
      type: Boolean,
      default: true
    },

    vertical: {
      type: String,
      default: 'left'
    },

    size: {
      type: String,
      default: null
    }
  },

  computed: {
    wallet () {
      const isReconciledCheck = (balances, calcBalance, reconciliationCadence) => {
        if (!balances || !balances.ending) {
          return false
        }
        const endingBalance = balances.ending
        const isBalancing = Math.abs(endingBalance.amount-calcBalance) < 0.01
        const isRecentEnough = (new Date().getTime() - new Date(endingBalance.date).getTime()) < reconciliationCadence
        return isBalancing && isRecentEnough
      }
      const wallet = this.$store.state.wallets.items[this.id];
      const walletTotal = this.$store.getters['wallets/walletsTotal'][this.id]
      const total = walletTotal.base
      const reconciliationCadence = walletTotal.reconciliationCadence
      const isClosed = wallet.closed
      const isReconciled = isReconciledCheck(wallet.balances, total, reconciliationCadence)
      const hasEndingBalance = wallet.balances && wallet.balances.ending
      const reconciledStatus = !isClosed && hasEndingBalance ? (isReconciled ? '👍 ' : '⛔ ') : ''
      const reconciledDate =  isClosed ? 'closed' : hasEndingBalance ? wallet.balances.ending.date.slice(5,10) : ''
      return {
        ...wallet,
        reconciledName: reconciledStatus + wallet.name,
        reconciledDate,
        total
      }
    }
  },

  methods: {
    handleClick () {
      if (this.$listeners.onClick) {
        this.$listeners.onClick(this.id)
      }
    },

    handleIconClick () {
      this.$store.dispatch('ui/setActiveTab', 'stat')
      this.$store.dispatch('filter/setFilterWalletId', this.id)
    }
  }
}
</script>

<template lang="pug">
.walletItemGrid(
  @click="handleClick"
)
  .walletItemGrid__line(:style="{ background: wallet.color || $store.state.ui.defaultBgColor }")
  .walletItemGrid__name 
    WalletsName( 
      :name="wallet.reconciledName"
      :tooltip="wallet.reconciledDate"
    )
  .walletItemGrid__amount
    Amount(
      :alwaysShowSymbol="true"
      :currency="wallet.currency"
      :showBase="showBase"
      :size="size"
      :value="wallet.total"
      :vertical="vertical"
    )
</template>

<style lang="stylus">
@import '~assets/stylus/variables'

.walletItemGrid
  overflow hidden
  cursor pointer
  padding 14px $m7
  padding-top 0
  background var(--c-bg-6)
  border-top 0
  border-radius $m5

  &__line
    opacity 1
    height 4px
    margin 0 (- $m7)
    margin-bottom 14px

  &__name
    padding-bottom $m5
    color var(--c-font-2)
    font-size 16px
</style>
