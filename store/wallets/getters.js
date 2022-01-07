// getWalletAmount
// walletsTotal
// walletsSortedIds

export default {
  hasWallets(state, getters, rootState) {
    if (rootState.wallets.items) {
      if (Object.keys(rootState.wallets.items).length > 0) {
        return true
      }
    }
    return false
  },

  getWalletCurrency: (state, getters, rootState) => (walletId) => {
    return rootState.wallets.items[walletId].currency
  },

  getWalletsCurrencies(state, getters, rootState) {
    if (!getters.hasWallets) { return [] }
    return Object.keys(rootState.wallets.items).map(walletId => rootState.wallets.items[walletId].currency)
  },

  getWalletAmount: (state, getters, rootState, rootGetters) => (walletId) => {
    const trns = rootState.trns.items
    let amount = rootState.wallets.items[walletId].openingBalance || 0
    const trnsIds = rootGetters['trns/getTrnsIdsInWallet'](walletId)
    for (const trnId of trnsIds) {
      if (trns[trnId]) {
        if (trns[trnId].type === 0) {
          amount = amount - trns[trnId].amount
        }
        else {
          amount = amount + trns[trnId].amount
        }
      }
    }
    return amount
  },

  walletsTotal(state, getters, rootState, rootGetters) {
    if (!getters.hasWallets) { return {} }
    const walletsTotal = {}
    const wallets = rootState.wallets.items

    const getWalletAmount = (walletId) => {
      const trns = rootState.trns.items
      const wallet = rootState.wallets.items[walletId]
      let amount = wallet.openingBalance || 0
      const trnsIds = rootGetters['trns/getTrnsIdsInWallet'](walletId)
      for (const trnId of trnsIds) {
        if (trns[trnId].type === 0) {
          amount = amount - trns[trnId].amount
        }
        else {
          amount = amount + trns[trnId].amount
        }
      }
      return amount || 0
    }

    Object.keys(wallets).forEach((id) => {
      const wallet = wallets[id]
      walletsTotal[id] = {
        base: getWalletAmount(id),
        currency: wallet.currency,
        reconciliationCadence: wallets[id].reconcileCadenceDays * 1000 * 60 * 60 * 24
      }
    })

    return walletsTotal
  },

  walletsSortedIds(state, getters) {
    if (!getters.hasWallets) { return [] }
    return Object.keys(state.items).sort((a, b) => {
      if (parseInt(state.items[a].order) < parseInt(state.items[b].order)) { return -1 }
      if (parseInt(state.items[a].order) > parseInt(state.items[b].order)) { return 1 }
      return 0
    })
  },

  walletsVisibleIds(state, getters) {
    if (!getters.hasWallets) { return [] }
    const ids = getters.walletsSortedIds
    const visibleIds = ids.filter(id => state.items[id].showInTx)
    return visibleIds
  }
}
