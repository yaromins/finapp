import type { WalletId, WalletItem, WalletItemWithAmount } from '~/components/wallets/types'

export default function useWallets() {
  const { $store } = useNuxtApp()

  /**
   * Wallets IDs sorted
   *
   */
  const walletsIdsSorted = computed<WalletId[]>(() => $store.getters['wallets/walletsSortedIds'])

  /**
   * Wallets items sorted
   *
   */
  const walletsItemsSorted = computed<Record<WalletId, WalletItemWithAmount>>(() => {
    const walletsIdsSorted: WalletId[] = $store.getters['wallets/walletsSortedIds']

    return walletsIdsSorted.reduce((acc, id) => {
      acc[id] ??= []
      const amount = $store.getters['wallets/walletsTotal'][id]
      const r13n = $store.state.wallets.r13nItems[id]
      const isUnderReconciliation = r13n != undefined
      const isReconciled = isUnderReconciliation && Math.abs(r13n.endingBalanceAmount - amount) <0.01
      acc[id] = {
        ...$store.state.wallets.items[id],
        amount,
        isUnderReconciliation,
        isReconciled
      }
      return acc
    }, {})
  })

  /**
   * Wallets currencies
   */
  const walletsCurrencies = computed<WalletId[]>(() => {
    const walletsIdsSorted: WalletId[] = $store.getters['wallets/walletsSortedIds']
    const walletsItems: Record<WalletId, WalletItem> = $store.state.wallets.items

    // TODO: check A
    return walletsIdsSorted.reduce((acc, id) => {
      const currency = walletsItems[id].currency
      !acc.includes(currency)
        && acc.push(currency)
      return acc
    }, [])
  })

  return {
    walletsIdsSorted,
    walletsItemsSorted,
    walletsCurrencies,
  }
}
