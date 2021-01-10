export default {
  getAmountInBaseCurrency: (state, getters, rootState) => ({ amount, currency, rate }) => {
    const fixed = rootState.currencies.base === 'RUB' ? 0 : 2
    const baseValue = (amount / (rate ? rate : rootState.currencies.rates[currency])).toFixed(fixed)
    return Number(baseValue)
  },
  getConvertedAmount: (state, getters, rootState) => ({ amount, fromCurrency, toCurrency }) => {
    if ( fromCurrency === toCurrency ) {
      return amount
    }
    const fixed = rootState.currencies.base === 'RUB' ? 0 : 2
    const baseValue = (amount / rootState.currencies.rates[fromCurrency])
    const convertedAmount = baseValue * rootState.currencies.rates[toCurrency]
    return Number(convertedAmount.toFixed(fixed))
  }

}
