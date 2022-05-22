import dayjs from 'dayjs'

export const state = () => ({
  action: 'create',
  height: '100%',

  modal: {
    calendar: false,
    categories: false,
    categoriesChild: false,
    description: false,
    transferFrom: false,
    transferTo: false,
    wallets: false,
    trn: false,
  },

  show: false,
  showModalCategoryId: null,
  showModalTrnId: null,

  values: {
    amount: '0',
    amountType: 0,
    categoryId: null,
    date: dayjs().valueOf(),
    description: null,
    trnId: null,
    walletId: null,
    incomeAmount: 0,
    incomeWalletId: null,
    expenseAmount: 0,
    expenseWalletId: null,
  },
})
