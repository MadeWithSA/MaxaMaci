import { T as BASE } from './data.js'
import { EXTRA } from './extra.js'

export { PRODUCTS } from './products.js'
export const T = Object.fromEntries(Object.keys(BASE).map((l) => [l, { ...BASE[l], ...EXTRA[l] }]))
