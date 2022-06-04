import type { ComputedRef } from '@vue/composition-api'
import type { WalletID, WalletItem, WalletItemWithAmount } from '~/components/wallets/types'

export default function useWallets() {
  const { $store } = useNuxtApp()

  /**
   * Wallets IDs sorted
   *
   */
  const walletsIdsSorted: ComputedRef<WalletID[]> = computed(() => $store.getters['wallets/walletsSortedIds'])

  /**
   * Wallets items sorted
   *
   */
  const walletsItemsSorted = computed<Record<WalletID, WalletItemWithAmount>>(() => {
    const walletsIdsSorted: WalletID[] = $store.getters['wallets/walletsSortedIds']

    // TODO: check A
    return walletsIdsSorted.reduce((acc, id) => {
      acc[id] ??= []
      const amount = $store.getters['wallets/walletsTotal'][id]
      const r13n = $store.state.wallets.r13nItems[id]
      const isUnderReconciliation = r13n != undefined
      const isReconciled = isUnderReconciliation && Math.abs(r13n.endingBalanceAmount - amount) <0.01
      acc[id] = {
        ...$store.state.wallets.items[id],
        amount: $store.getters['wallets/walletsTotal'][id],
        isReconciled
      }
      return acc
    }, {})
  })

  /**
   * Wallets currencies
   */
  const walletsCurrencies = computed(() => {
    const walletsIdsSorted: WalletID[] = $store.getters['wallets/walletsSortedIds']
    const walletsItems: Record<WalletID, WalletItem> = $store.state.wallets.items

    // TODO: check A
    return walletsIdsSorted.reduce((acc, id) => {
      const currency = walletsItems[id].currency
      if (!acc.includes(currency))
        acc.push(currency)
      return acc
    }, [])
  })

  return {
    walletsIdsSorted,
    walletsItemsSorted,
    walletsCurrencies,
  }
}
