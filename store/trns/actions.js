import localforage from 'localforage'
import dayjs from 'dayjs'

import {
  removeTrnToAddLaterLocal,
  saveTrnToAddLaterLocal,
  saveTrnIDforDeleteWhenClientOnline,
  removeTrnToDeleteLaterLocal
} from './helpers'
import { db } from '~/services/firebase'

export default {
  /**
    * Create new trn
    * and save it to local storage when Client offline
    *
    * @param {object}
    * @param {string} {}.id
    * @param {object} {}.values
    * @param {string} {}.values.amount
    * @param {string} {}.values.category
  */
  addTrn({ commit, rootState, rootGetters }, { id, values }) {
    const uid = rootState.user.user.uid
    const trns = rootState.trns.items
    let isTrnSavedOnline = false
    const amount = Number(String(values.amount).replace(/\s+/g, ''))
    const currency = rootGetters['wallets/getWalletCurrency'](values.walletId)
    const date = dayjs(values.date)
    const baseValue = rootGetters['currencies/getAmountInBaseCurrency']({ amount, currency })
    const formatedTrnValues = {
      amount,
      baseValue,
      categoryId: values.categoryId,
      date: date.valueOf(),
      description: values.description || null,
      edited: dayjs().valueOf(),
      groups: values.groups || null,
      type: Number(values.amountType) || 0,
      walletId: values.walletId
    }
    // is this part of transfer transaction?
    if (values.transferTrnId) {
      formatedTrnValues.transferTrnId = values.transferTrnId
    }
    localforage.setItem('finapp.trns', { ...trns, [id]: formatedTrnValues })
    commit('setTrns', Object.freeze({ ...trns, [id]: formatedTrnValues }))

    db.ref(`users/${uid}/trns/${id}`)
      .set(formatedTrnValues)
      .then(() => {
        // if transaction is not from today let adjust the baseValue if rate is present in archive
        if (!dayjs().isSame(date, 'day')) {
          const asOfDate = date.format('YYYYMMDD')
          const baseCurrency = rootState.currencies.base
          db.ref(`currencies/_archive/${baseCurrency}/${asOfDate}/${currency}`).once('value').then((snapshot) => {
            const rate = snapshot.val()
            if (rate) {
              const fixedBaseValue = { ...formatedTrnValues }
              fixedBaseValue.baseValue = rootGetters['currencies/getAmountInBaseCurrency']({ amount, currency, rate })
              db.ref(`users/${uid}/trns/${id}`).set(fixedBaseValue)
            }
          })
        }
        isTrnSavedOnline = true
        removeTrnToAddLaterLocal(id)
      })

    setTimeout(() => {
      if (!isTrnSavedOnline) { saveTrnToAddLaterLocal({ id, values }) }
    }, 100)

    commit('trnForm/setTrnFormValues', {
      trnId: null,
      amount: '0',
      amountEvaluation: null,
      description: null
    }, { root: true })
  },

  // delete
  deleteTrn({ commit, dispatch, rootState }, id) {
    const uid = rootState.user.user.uid
    const trns = { ...rootState.trns.items }
    const trn = trns[id];

    // is this part of transfer transaciton?
    if (trn.transferTrnId) {  
      dispatch('deleteTransferTrn', [id, trn.transferTrnId])
    } else {
      // proceed with single transaction delete
      delete trns[id]
      commit('setTrns', Object.freeze(trns))
      localforage.setItem('finapp.trns', trns)
      saveTrnIDforDeleteWhenClientOnline(id)

      db.ref(`users/${uid}/trns/${id}`)
        .remove()
        .then(() => removeTrnToDeleteLaterLocal(id))
    }
  },

  deleteTransferTrn({ commit, rootState }, ids) {
    const uid = rootState.user.user.uid
    const trns = { ...rootState.trns.items }

    ids.forEach( id => delete trns[id])
    commit('setTrns', Object.freeze(trns))
    localforage.setItem('finapp.trns', trns)
    ids.forEach( id => {
      saveTrnIDforDeleteWhenClientOnline(id)
      db.ref(`users/${uid}/trns/${id}`)
      .remove()
      .then(() => removeTrnToDeleteLaterLocal(id))
    })
  },

  async deleteTrnsByIds({ rootState }, trnsIds) {
    const uid = rootState.user.user.uid
    const trnsForDelete = {}
    for (const trnId of trnsIds) {
      trnsForDelete[trnId] = null
    }

    await db.ref(`users/${uid}/trns`)
      .update(trnsForDelete)
      .then(() => console.log('trns deleted'))
  },

  // init
  async initTrns({ rootState, dispatch, commit }) {
    const uid = rootState.user.user.uid

    await db.ref(`users/${uid}/trns`).on('value', (snapshot) => {
      const items = Object.freeze(snapshot.val())
      if (items) {
        for (const trnId of Object.keys(items)) {
          if (!items[trnId].walletId || items[trnId].accountId) {
            commit('app/setAppStatus', 'loading', { root: true })
            const trn = items[trnId]
            db.ref(`users/${uid}/trns/${trnId}`)
              .set({
                amount: trn.amount,
                baseValue: trn.baseValue || 0,
                categoryId: trn.categoryId,
                date: Number(trn.date),
                description: trn.description || null,
                edited: dayjs().valueOf(),
                groups: trn.groups || null,
                budgets: trn.budgets || null,
                type: Number(trn.type),
                walletId: trn.accountId || trn.walletId
              })
          }
        }
      }
      dispatch('setTrns', items)
    }, e => console.error(e))
  },

  setTrns({ commit }, items) {
    commit('setTrns', items)
    localforage.setItem('finapp.trns', items)
  },

  unsubcribeTrns({ rootState }) {
    const uid = rootState.user.user.uid
    db.ref(`users/${uid}/trns`).off()
  },

  /**
    * Add and delete trns with had been created in offline mode
    *
    * When user online
    * get trns from local storage
    * and add them to database
  */
  uploadOfflineTrns({ dispatch, rootState }) {
    db.ref('.info/connected').on('value', async (snap) => {
      const isConnected = snap.val()
      if (isConnected) {
        const trnsArrayForDelete = await localforage.getItem('finapp.trns.offline.delete') || []
        const trnsItemsForUpdate = await localforage.getItem('finapp.trns.offline.update') || {}

        // delete trns
        for (const trnId of trnsArrayForDelete) {
          dispatch('deleteTrn', trnId)
          delete trnsItemsForUpdate[trnId]
        }

        await localforage.setItem('finapp.trns.offline.update', trnsItemsForUpdate)

        // add trns
        for (const trnId in trnsItemsForUpdate) {
          const wallet = rootState.wallets.items[trnsItemsForUpdate[trnId].walletId]
          const category = rootState.categories.items[trnsItemsForUpdate[trnId].categoryId]

          // delete trn from local storage if no wallet or category
          if (!wallet || !category) {
            delete trnsItemsForUpdate[trnId]
            await localforage.setItem('finapp.trns.offline.update', trnsItemsForUpdate)
          }

          // add
          else if (trnsItemsForUpdate[trnId] && trnsItemsForUpdate[trnId].amount) {
            console.log('update', trnsItemsForUpdate[trnId])
            dispatch('addTrn', {
              id: trnId,
              values: trnsItemsForUpdate[trnId]
            })
          }
        }
      }
    })
  }
}
