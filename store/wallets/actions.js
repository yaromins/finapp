import localforage from 'localforage'
import { getDataAndWatch, saveData, unsubscribeData, updateData } from '~/services/firebase/api'

export default {
  initWallets({ dispatch, rootState }) {
    const uid = rootState.user.user.uid
    getDataAndWatch(`users/${uid}/accounts`, (items) => {
      dispatch('setWallets', Object.freeze(items || {}))
    })
  },

  initWalletsR13N({ dispatch, rootState }) {
    const uid = rootState.user.user.uid
    getDataAndWatch(`users/${uid}/accountsR13N`, (items) => {
      dispatch('setWalletsR13N', Object.freeze(items || {}))
    })
  },
  
  setWalletsR13N({ commit }, items) {
    commit('setWalletsR13N', items)
    localforage.setItem('finapp.wallets.r13n', items)
  },

  setWallets({ commit }, items) {
    commit('setWallets', items)
    localforage.setItem('finapp.wallets', items)
  },

  addWallet({ dispatch, rootState, getters }, { id, values }) {
    const uid = rootState.user.user.uid

    const formattedValues = {
      color: values.color,
      countTotal: values.countTotal,
      currency: values.currency,
      isCredit: values.isCredit,
      name: values.name,
      order: parseInt(values.order) || 1,
    }

    // set default currency based on first created wallet
    if (!getters.hasWallets)
      dispatch('currencies/setBaseCurrency', values.currency, { root: true })

    saveData(`users/${uid}/accounts/${id}`, formattedValues)
  },

  /**
    * Get object of wallets with order value
    * Create object with path to order field in DB
    * Update only order field for each wallet
    *
  */
  async saveWalletsOrder({ rootGetters }, wallets) {
    const updates = {}
    const result = {}

    for (const walletId in wallets)
      updates[`${walletId}/order`] = wallets[walletId]

    await updateData(`users/${rootGetters['user/userUid']}/accounts`, updates)
      .then(() => { result.success = 'Updated' })
      .catch((error) => { result.error = error })

    return result
  },

  unsubscribeWallets({ rootGetters }) {
    const uid = rootGetters['user/userUid']
    unsubscribeData(`users/${uid}/accounts`)
    unsubscribeData(`users/${uid}/accountsR13N`)
  },
}
