import type { CategoryID } from '~/components/categories/types'

// TODO: add typings
export function getCatsIds(catsIds: CategoryID[], catsItems) {
  const ids = []

  for (const catId of catsIds) {
    const category = catsItems[catId]
    category?.childIds
      ? ids.push(...category.childIds)
      : ids.push(catId)
  }

  return ids
}

// TODO: add typings
export function getTransferCategoriesIds(categoriesItems): CategoryID[] {
  const names = ['перевод', 'transfer']

  const categoriesIdsByName = Object
    .keys(categoriesItems)
    .filter(id => names.includes(categoriesItems[id].name.toLowerCase()))

  return [...categoriesIdsByName, 'transfer', 'unclassified']
}
