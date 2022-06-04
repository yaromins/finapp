export default {
  setCategories(state, items) {
    const freezedItems = {}
    if (items) {
      for (const itemId of Object.keys(items))
        freezedItems[itemId] = Object.freeze(items[itemId])
    }

    state.items = {
      ...freezedItems,
      transfer: {
        color: 'var(--c-black-1)',
        icon: 'mdi mdi-repeat',
        name: 'transfer',
        order: 998,
        parentId: 0,
        childIds: [],
        showInLastUsed: false,
        showInQuickSelector: false,
        showStat: false,
      },
      unclassified: {
        color: 'var(--c-black-1)',
        icon: 'mdi mdi-debian',
        name: 'unclassified',
        order: 999,
        parentId: 0,
        childIds: [],
        showInLastUsed: false,
        showInQuickSelector: false,
        showStat: false,
      },
    }
  },
}
