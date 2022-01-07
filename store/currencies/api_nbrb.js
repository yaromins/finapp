import axios from 'axios'

const openratesUrl = 'https://api.openrates.io'
const nbrbUrl = 'https://www.nbrb.by'

export const getRatesOf = async (baseCurrency) => {
  if (!baseCurrency) {
    console.error('No base currency')
    return
  }

  const currencies = await axios.get(`${openratesUrl}/latest?base=${baseCurrency}`)
  const base2byn = await axios.get(`${nbrbUrl}/api/exrates/rates/${baseCurrency}?parammode=2`)
  if (currencies && currencies.data) {
    if (base2byn) {
      const { Cur_Scale, Cur_OfficialRate } = base2byn.data
      currencies.data.rates["BYN"] = Cur_OfficialRate / Cur_Scale;
    }
    return currencies.data.rates
  }
  else {
    console.log('api unavaliable')
  }
}
