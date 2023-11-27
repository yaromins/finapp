import type { CategoryId } from "~/components/categories/types"
import type { TrnId, TrnItem } from "~/components/trns/types"
import type { WalletId, WalletItem } from "~/components/wallets/types"
import { TrnType } from "~/components/trns/types"

export function getAmountInRate({
  amount,
  currencyCode,
  baseCurrencyCode,
  rates,
}: {
  amount: number
  currencyCode: string
  baseCurrencyCode: string // TODO: add typings
  rates: Record<string, number> // TODO: add typings
}): number {
  if (!baseCurrencyCode || !rates) return amount

  if (baseCurrencyCode !== currencyCode) return (amount / rates[currencyCode]) * rates[baseCurrencyCode]

  return amount
}

interface TotalProps {
  trnsIds: TrnId[]
  trnsItems: Record<TrnId, TrnItem>
  walletsItems: Record<WalletId, WalletItem>
  transferCategoriesIds?: CategoryId[]
  walletsIds?: WalletId[]
  baseCurrencyCode?: string // TODO: add typings
  rates?: Record<string, number> // TODO: add typings
}

export interface TotalReturns {
  incomeTransactions: number
  expenseTransactions: number
  sumTransactions: number
  incomeTransfers: number
  expenseTransfers: number
  sumTransfers: number
}

export function getTotal(props: TotalProps): TotalReturns {
  const { baseCurrencyCode, rates, transferCategoriesIds, trnsIds, trnsItems, walletsIds, walletsItems } = props

  function getAmount(amount: number, baseValue: number, currencyCode: string) {
    if (walletsIds?.length == 1) {
      // to have ending balance calculated correctly for single wallet
      return getAmountInRate({
        amount,
        baseCurrencyCode,
        currencyCode,
        rates,
      })
    } else {
      // to have stats calculated correctly based on historical rates
      return baseValue || amount
    }
  }

  let incomeTransactions = 0
  let expenseTransactions = 0
  let incomeTransfers = 0
  let expenseTransfers = 0

  for (const trnId of trnsIds) {
    const trn = trnsItems[trnId]

    // Transaction
    if (trn.type === TrnType.Income || trn.type === TrnType.Expense) {
      const isTransferCategory = transferCategoriesIds?.includes(trn.categoryId)
      const wallet = walletsItems[trn.walletId]
      const sum = getAmount(trn.amount, trn.baseValue, wallet.currency)

      // Income
      if (trn.type === TrnType.Income) {
        isTransferCategory ? (incomeTransfers += sum) : (incomeTransactions += sum)
      }

      // Expense
      if (trn.type === TrnType.Expense) {
        isTransferCategory ? (expenseTransfers += sum) : (expenseTransactions += sum)
      }
    }

    // Transfer v2
    else if (trn.type === TrnType.Transfer && "incomeWalletId" in trn) {
      const incomeWallet = walletsItems[trn.incomeWalletId]
      const expenseWallet = walletsItems[trn.expenseWalletId]
      const incomeAmount = getAmount(trn.incomeAmount, trn.incomeBaseValue, incomeWallet.currency)
      const expenseAmount = getAmount(trn.expenseAmount, trn.expenseBaseValue, expenseWallet.currency)

      // Include only selected wallets
      if (walletsIds && walletsIds.length > 0) {
        // Income
        if (walletsIds.includes(trn.incomeWalletId)) incomeTransfers += incomeAmount

        // Expense
        if (walletsIds.includes(trn.expenseWalletId)) expenseTransfers += expenseAmount
      }

      // Include all wallets
      else {
        incomeTransfers += incomeAmount
        expenseTransfers += expenseAmount
      }
    }

    // Transfer @deprecated
    else if (trn.type === TrnType.Transfer && "walletFromId" in trn) {
      const incomeWallet = walletsItems[trn.walletToId]
      const expenseWallet = walletsItems[trn.walletFromId]
      const incomeAmount = getAmount(trn.amountTo, trn.amountTo, incomeWallet.currency)
      const expenseAmount = getAmount(trn.amountFrom, trn.amountFrom, expenseWallet.currency)

      // Include only selected wallets
      if (walletsIds && walletsIds.length > 0) {
        // Income
        if (walletsIds.includes(trn.walletToId)) incomeTransfers += incomeAmount

        // Expense
        if (walletsIds.includes(trn.walletFromId)) expenseTransfers += expenseAmount
      }

      // Include all wallets
      else {
        incomeTransfers += incomeAmount
        expenseTransfers += expenseAmount
      }
    }
  }
  // Total
  const sumTransactions = incomeTransactions - expenseTransactions
  const sumTransfers = incomeTransfers - expenseTransfers

  return {
    incomeTransactions,
    expenseTransactions,
    sumTransactions,

    incomeTransfers,
    expenseTransfers,
    sumTransfers,
  }
}
