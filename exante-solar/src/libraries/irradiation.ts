export function getActualIrradiationTotal(
  actualValues: { datetime: string; value: string }[],
  start: Date,
  end: Date
): number {
  return actualValues
    .filter(entry => {
      const date = new Date(entry.datetime)
      return date >= start && date <= end
    })
    .reduce((sum, entry) => sum + parseFloat(entry.value), 0)
}

export function getExpectedIrradiationTotal(
  expectedValues: { datetime: string; value: string }[],
  start: Date,
  end: Date
): number {
  return expectedValues
    .filter(entry => {
      const date = new Date(entry.datetime)
      return date >= start && date <= end
    })
    .reduce((sum, entry) => sum + parseFloat(entry.value), 0)
}