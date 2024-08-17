<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { onMounted } from 'vue'

defineProps<{
  title: string
}>()

const emit = defineEmits(['click', 'closed'])
const { height } = useWindowSize()
const searchInput = ref('')

function onClickWallet(walletId, close) {
  emit('click', walletId)
  close()
}

</script>

<template lang="pug">
BaseTopSheet(
  :maxHeight="height"
  insideClass="sm_rounded-b-2xl bg-layout-main"
  @closed="emit('closed')"
)
  template(#handler="{ close }")
    BaseBottomSheetHandler
    BaseBottomSheetClose(@onClick="close")

  template(#header)
    .py-4.px-2.text-center.text-item-base.text-xl.font-nunito.font-semibold.bg-layout-main.rounded-t-2xl
      | {{ title }}

    .px-2
    input.w-full.m-0.py-2.px-3.rounded-lg.text-base.font-normal.text-item-base.bg-item-main-bg.border.border-solid.border-item-main-hover.placeholder_text-item-base-down.transition.ease-in-out.focus_text-item-base-up.focus_bg-item-main-hover.focus_border-blue3.focus_outline-none(
      placeholder="Search..."
      v-model="searchInput"
      type="text"
    )

  template(#default="{ close }")
  
  
    WalletsList(#default="{ walletsItemsSorted }")
      .pb-3.px-2.grid.gap-1
        //- Wallet
        .cursor-pointer.flex.items-center.py-2.px-3.rounded-md.bg-item-main-bg.hocus_bg-item-main-hover(
            v-for="(walletItem, walletId) in walletsItemsSorted"
            v-if="walletItem.name.toLowerCase().includes(searchInput.toLowerCase())"
          :key="walletId"
          @click="onClickWallet(walletId, close)"
        )
          .grow.gap-x-3.flex.items-center
            .grow.flex-center.gap-x-3
              //- Icon
              .w-6.h-6.rounded-md.flex-center.text-icon-base.text-xs.leading-none(
                :style="{ background: walletItem.color }"
                class="mt-[2px]"
              ) {{ walletItem.name.substring(0, 2) }}
              //- Name
              .grow.text-sm.text-item-base {{ walletItem.name }}

            //- Amount
            .text-item-base
              Amount(
                :amount="walletItem.amount"
                :currencyCode="walletItem.currency"
              )
</template>

<i18n lang="yaml">
  en:
    notFound: Wallet not found...
  
  ru:
    notFound: Кошелек не найден...
</i18n>