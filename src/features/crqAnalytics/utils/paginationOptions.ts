/** Rows-per-page choices shared by the utilization tables.
 *
 * Options above the row count are dropped (picking 50 out of 18 rows is a
 * no-op choice) and the row count itself is appended, so the last entry of the
 * dropdown is always "show every row". `currentPageSize` is kept in the list
 * even once it stops being valid — otherwise the MUI Select behind the
 * "Rows per page" control would hold a value that is no longer an option. */
const BASE_OPTIONS = [5, 10, 15, 20, 25, 50, 100];

export function buildRowsPerPageOptions(totalRowCount: number, currentPageSize?: number): number[] {
  const options = new Set<number>();

  for (const option of BASE_OPTIONS) {
    if (totalRowCount <= 0 ? option <= 10 : option < totalRowCount) options.add(option);
  }
  if (totalRowCount > 0) options.add(totalRowCount);
  if (currentPageSize && currentPageSize > 0) options.add(currentPageSize);

  return Array.from(options).sort((a, b) => a - b);
}
