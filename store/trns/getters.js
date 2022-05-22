import dayjs from 'dayjs'
import { getCategoriesIds, getTransferCategoriesIds } from '~/components/categories/getCategories'
import { getTrnsIds } from '~/components/trns/getTrns'

export default { 
  hasTrns(_state, _getters, rootState) {
    if (rootState.trns.items) {
      if (Object.keys(rootState.trns.items).length > 0)
        return true
    }
    return false
  },

  /**
    * Return total amounts of trnsIds
    * * Refactor: params should be Object
    *
    * @param {Array} trnsIds
    * @return {Object} return
    * @return {String} return.expenses
    * @return {String} return.incomes
    * @return {String} return.total
  */
  getTotalOfTrnsIds: (_state, _getters, rootState, rootGetters) => (trnsIds, inculdeTrnasfers = false, isConvertToBase = true, walletId) => {
    const trns = rootState.trns.items
    const currencies = rootState.currencies.rates
    const wallets = rootState.wallets.items
    const baseCurrency = rootState.currencies.base
    const transferCategoryId = rootGetters['categories/transferCategoryId']

    let expenses = 0
    let incomes = 0

    for (const key of trnsIds) {
      const trn = trns[key]
      if (trn && (inculdeTrnasfers || trn.categoryId !== transferCategoryId)) {
        // Transaction
        if (trn.type !== 2) {
          const wallet = wallets[trn.walletId]
          if (!wallet && currencies)
            return

          let amount = 0
          isConvertToBase && wallet.currency !== baseCurrency
            ? amount = Math.abs(trn.amount / currencies[wallet.currency])
            : amount = trn.amount

          trn.type === 1
            ? incomes = incomes + amount
            : expenses = expenses + amount
        }

        // Transfer
        if (trn.type === 2 && inculdeTrnasfers) {
          if (walletId === trn.walletFromId || walletId === trn.expenseWalletId)
            expenses = expenses + (trn.expenseAmount ? trn.expenseAmount : trn.amount)

          if (walletId === trn.walletToId || walletId === trn.incomeWalletId)
            incomes = incomes + (trn.incomeAmount ? trn.incomeAmount : trn.amount)
        }
      }
    }
    return {
      expense: Math.abs(+expenses.toFixed(0)),
      income: Math.abs(+incomes.toFixed(0)),
      sum: parseInt((incomes - expenses).toFixed(0)),
      // @deprecated
      expenses: Math.abs(+expenses.toFixed(0)),
      incomes: Math.abs(+incomes.toFixed(0)),
      total: parseInt((incomes - expenses).toFixed(0)),
    }
  },

  lastCreatedTrnId(state, getters, rootState, rootGetters) {
    if (!getters.hasTrns)
      return

    const trnsItems = rootState.trns.items
    const categoriesItems = rootState.categories.items
    const transferCategoriesIds = getTransferCategoriesIds(categoriesItems)

    return Object.keys(trnsItems)
      .sort((a, b) => trnsItems[b].date - trnsItems[a].date)
      .find(trnId =>
        !transferCategoriesIds.includes(trnsItems[trnId].categoryId)
        && trnsItems[trnId].type !== 2,
      )
  },

  firstCreatedTrnId(_state, getters, rootState) {
    if (!getters.hasTrns)
      return

    const trnsItems = rootState.trns.items
    const trnsIds = Object.keys(trnsItems)
      .sort((a, b) => trnsItems[b].date - trnsItems[a].date)
      .reverse()

    return trnsIds[0]
  },

  firstCreatedTrnIdFromSelectedTrns(_state, getters) {
    const trnsIds = [...getters.selectedTrnsIds].reverse()
    if (trnsIds.length)
      return trnsIds[0]
  },

  selectedTrnsIds(_state, getters, rootState) {
    if (!getters.hasTrns)
      return []

    const trnsItems = rootState.trns.items
    const categoriesItems = rootState.categories.items
    const storeFilter = rootState.filter

    // TODO: move it to a separate function getFilterParams
    const categoriesIds = rootState.filter.catsIds.length > 0
      ? getCategoriesIds(rootState.filter.catsIds, categoriesItems)
      : null
    const walletsIds = storeFilter.walletsIds.length > 0
      ? storeFilter.walletsIds
      : null

    return getTrnsIds({
      trnsItems,
      walletsIds,
      categoriesIds,
    })
  },

  // TODO: should use components/trns/getTrns when its compatible
  selectedTrnsIdsWithDate(_state, getters, rootState) {
    if (!getters.hasTrns)
      return []

    const trnsItems = rootState.trns.items
    const filterDate = dayjs(rootState.filter.date)
    const filterPeriod = rootState.filter.period
    const startDateValue = filterDate.startOf(filterPeriod).valueOf()
    const endDateValue = filterDate.endOf(filterPeriod).valueOf()
    let trnsIds = getters.selectedTrnsIds

    // filter date
    if (filterPeriod !== 'all') {
      trnsIds = trnsIds.filter(trnId =>
        (trnsItems[trnId].date >= startDateValue)
          && (trnsItems[trnId].date <= endDateValue))
    }

    return trnsIds.sort((a, b) => trnsItems[b].date - trnsItems[a].date)
  },
}
