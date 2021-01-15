<script>
import { evaluate, round } from 'mathjs'

export default {
  computed: {
    amountString () {
      return String(this.$store.state.trnForm.values.amount)
    },

    amountIsNumber () {
      if (this.amountString == 0) { return true }
      return Number(this.unlocalize(this.amountString))
    },

    submitClassName () {
      const amountSplit = this.amountString.split(/(\/|\*|-|\+)/).filter(i => i)
      return {
        _zero: +this.amountString === 0,
        _math: +this.amountString !== 0 && amountSplit.length > 1
      }
    },

    decimalSeparator () {
      return new Number(1.01).toLocaleString()[1]
    },

    buttonName () {
      if (this.submitClassName._zero) {
        return 'Write amount'
      }
      else if (this.submitClassName._math) {
        return `Calculate ${this.amountEvaluation}`
      }
      return 'name'
    }
  },

  methods: {

    isNumber (value) {
      const unlocalized = this.unlocalize(value)
      return Number(unlocalized) == Number(unlocalized)
    },

    handlePress (event, eventType) {
      const amount = this.amountString
      const value = event.target.textContent
      const isValueNumber = this.isNumber(value)
      const amountSplit = amount.split(/(\/|\*|-|\+)/).filter(i => i)
      const lastItem = this.unlocalize([...amountSplit].reverse()[0])
      const isLastItemNumber = this.isNumber(lastItem)
      
      // remove
      if (eventType === 'dot' ) {
        const combined = `${lastItem}${this.decimalSeparator}`
        if (this.isNumber(combined)) {
          this.setTrnFormAmount(`${amount}${this.decimalSeparator}`)
        }
      }

      if (eventType === 'remove') {
        if (amount.length > 1) {
          const amountWithouLastNumber = amountSplit.slice(0, -1).join('')
          if (lastItem.length > 1) {
            const lastNumber = this.unlocalize(lastItem.slice(0, -1))
            const formatedLastNumber = Number(lastNumber).toLocaleString()
            const combinedAmount = amountWithouLastNumber + formatedLastNumber
            this.setTrnFormAmount(combinedAmount)
          }
          else {
            this.setTrnFormAmount(amountWithouLastNumber)
          }
        }
        else {
          this.setTrnFormAmount('0')
        }
        return
      }

      // action
      if (eventType === 'action' && lastItem !== '0') {
        if (isLastItemNumber) {
          this.setTrnFormAmount(`${amount}${value}`)
        }
        else {
          const amountWithoutOperator = amount.slice(0, -1)
          this.setTrnFormAmount(`${amountWithoutOperator}${value}`)
        }
        return
      }

      // number
      if (isValueNumber) {
        if (amount === '0') {
          this.setTrnFormAmount(value)
        }
        // usual number
        else if (isLastItemNumber) {
          if (lastItem.length < 15) {
            const formatNumberToLocale = (value) => {
              const formattedNumber = Number(value).toLocaleString()
              if (value.endsWith(`${this.decimalSeparator}0`)) {
                // to handle 0.01 case correctly
                return `${formattedNumber}${this.decimalSeparator}0`
              } 
              return formattedNumber 
            }
            // first number
            if (amountSplit.length === 1) {
              const joinedAmount = this.unlocalize(amount + value)
              const formatedAmount = formatNumberToLocale(joinedAmount)
              this.setTrnFormAmount(formatedAmount)
            }
            // number with action
            else {
              const amountWithouLastNumber = amountSplit.slice(0, -1).join('')
              const lastNumber = this.unlocalize(lastItem + value)
              const formatedLastNumber = formatNumberToLocale(lastNumber)
              const combinedAmount = amountWithouLastNumber + formatedLastNumber
              this.setTrnFormAmount(combinedAmount)
            }
          }
        }
        // after action
        else {
          this.setTrnFormAmount(`${amount}${value}`)
        }
      }
    },

    getSeparator(separatorType, locale) {
        const numberWithGroupAndDecimalSeparator = 1000.1;
        return Intl.NumberFormat(locale)
            .formatToParts(numberWithGroupAndDecimalSeparator)
            .find(part => part.type === separatorType)
            .value;
    },

    unlocalize(strNum) {
      const groupSeparator = this.getSeparator('group')
      const decimalSeparator = this.getSeparator('decimal')
      // hack to handle mathjs inability to work with locale formatted numbers
      return strNum.replace(/\s+/g, '').replaceAll(groupSeparator,'').replaceAll(decimalSeparator, '.')
    },

    evaluateAmount (amount) {
      try {
        const amountString = this.unlocalize(String(amount))

        if (amountString.search((/(\D)/)) !== -1) {
          const lastItem = amountString.slice(-1)
          const isLastItemNumber = this.isNumber(lastItem)
          let sum = ''
          isLastItemNumber
            ? sum = evaluate(amountString)
            : sum = evaluate(amountString.slice(0, -1))
            
          return `${Number(round(Math.abs(sum),2)).toLocaleString()}`
        }
      }
      catch (error) {
        console.log(error)
        // this.$notify({
        //   type: 'error',
        //   text: this.$t('trnForm.empty'),
        //   title: random(errorEmo)
        // })
      }
    },

    handleMath () {
      if (this.$store.state.trnForm.values.amountEvaluation) {
        const amount = this.$store.state.trnForm.values.amountEvaluation
        this.$store.commit('trnForm/setTrnFormValues', {
          amount,
          amountEvaluation: null
        })
      }
    },

    handleClear () {
      this.setTrnFormAmount('0')
    },

    setTrnFormAmount (amount) {
      this.$store.commit('trnForm/setTrnFormValues', {
        amount,
        amountEvaluation: this.evaluateAmount(amount)
      })
    }
  }
}
</script>

<template lang="pug">
.trnFormCalculator
  .calcItem._act(@click="event => handlePress(event, 'action')")
    .calcItem__in +
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 7
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 8
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 9

  .calcItem._act(@click="event => handlePress(event, 'action')")
    .calcItem__in -
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 4
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 5
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 6

  .calcItem._act(@click="event => handlePress(event, 'action')")
    .calcItem__in *
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 1
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 2
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 3

  .calcItem._act(@click="event => handlePress(event, 'action')")
    .calcItem__in /
  .calcItem._clear(v-longpress="handleClear" @click="event => handlePress(event, 'remove')")
    .calcItem__in C
  .calcItem._num(@click="event => handlePress(event, 'number')")
    .calcItem__in 0
  .calcItem._num(@click="event => handlePress(event, 'dot')")
    .calcItem__in {{decimalSeparator}}

  .calcItem._sum(
    @click="amountIsNumber ? $emit('onFormSubmit') : handleMath()"
    :class="{ _expenses: $store.state.trnForm.values.amountType === 0, _incomes: $store.state.trnForm.values.amountType === 1 }"
  )
    .calcItem__in
      template(v-if="amountIsNumber")
        .mdi.mdi-check
      template(v-else)
        .mdi.mdi-equal
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/animations"
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/fonts"
@import "~assets/stylus/variables/media"

.trnFormCalculator
  display grid
  grid-template-columns repeat(5, minmax(10px, 1fr))
  grid-template-rows repeat(4, minmax(10px, 1fr))
  grid-column-gap 8px
  grid-row-gap 8px
  padding $m7

.calcItem
  display flex
  align-items center
  justify-content center
  font-secondary()
  anim()

  ~/._sum
    grid-column 5 / 6
    grid-row 1 / -1
    align-items stretch
    padding-left 4px
    color var(--c-font-1)

  &__in
    display flex
    align-items center
    justify-content center
    width 40px
    height 40px
    font-size 22px
    border-bottom 0
    border-right 0
    border-radius 50%

    @media $media-phone-normal
      padding $m8

    ~/._num &
      color var(--c-font-3)
      background var(--c-bg-5)

    ~/._act &
      color var(--c-font-4)

    ~/._clear &
      color var(--c-font-5)

    ~/._sum &
      width 100%
      height 100%
      font-size 40px
      background var(--c-blue-1)
      border-radius 6px

      ~/._expenses &
        background var(--c-expenses-1)

      ~/._incomes &
        background var(--c-incomes-1)

    &:active
      background var(--c-bg-3)
      transform scale(1.1)
</style>
