/**
 * Utility functions for working with JSON paths
 */

/**
 * Convert a JSON path array to a dot-notation string.
 * @example
 *   pathToString(['author', 'name'])       → 'root.author.name'
 *   pathToString(['items', 0, 'id'])       → 'root.items[0].id'
 *   pathToString([])                       → 'root'
 */
export function pathToString(path: (string | number)[]): string {
  if (path.length === 0) return 'root'

  let result = 'root'
  for (const segment of path) {
    if (typeof segment === 'number') {
      result += `[${segment}]`
    } else {
      result += `.${segment}`
    }
  }
  return result
}
