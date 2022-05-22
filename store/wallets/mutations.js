export default {
  setWallets(state, items) {
    const freezedItems = {}
    if (items) {
      for (const itemId of Object.keys(items))
        freezedItems[itemId] = Object.freeze(items[itemId])
    }
    state.items = freezedItems
  },
  setWalletsR13N(state, items) {
    const freezedItems = {}
    if (items) {
      for (const itemId of Object.keys(items))
        freezedItems[itemId] = Object.freeze(items[itemId])
    }
    state.r13nItems = freezedItems
  },
}
