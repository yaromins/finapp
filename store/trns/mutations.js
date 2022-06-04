export default {
  setTrns(state, items) {
    const freezedItems = {}
    if (items) {
      for (const itemId of Object.keys(items))
        freezedItems[itemId] = Object.freeze(items[itemId])
    }

    state.items = freezedItems
  },

  showTrnModal(state) {
    state.modal.show = true
  },

  hideTrnModal(state) {
    state.modal.show = false
  },

  setTrnModalId(state, id) {
    state.modal.id === id
      ? state.modal.id = null
      : state.modal.id = id
  },
}
