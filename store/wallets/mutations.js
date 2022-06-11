export default {
  setWallets(state, items) {
    if (!items) {
      state.items = {}
      return
    }

    state.items = Object.keys(items).reduce((acc, id) => {
      acc[id] = Object.freeze(items[id])
      return acc
    }, {})
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
