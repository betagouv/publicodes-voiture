import { CarSimulator, Alternative } from "../src/CarSimulator"

const simulator = new CarSimulator()

const periods_of_detentions = [3, 5.5, 10]

for (const period of periods_of_detentions) {
  simulator.setInputs({
    "voiture . durée de détention totale": period,
  })
  const alternatives = simulator.evaluateAlternatives()
  showMardownTableSummary(
    period,
    simulator.getEngine().evaluate("usage . km annuels").nodeValue as number,
    alternatives.filter((a) => a.kind === "car"),
  )
}

/**
 * Display a summary of the alternatives in a markdown table.
 *
 * In particular, the type of the alternative (size/motorisation/fuel), the
 * emissions and the costs, with details of the distribution between
 * usage/ownership (both numerically and in percentage) for each emissions and
 * costs.
 *
 * A legend is also displayed at the beginning of the table, with details about
 * the period of detention and the total km driven used for the calculation.
 */
function showMardownTableSummary(
  period: number,
  km: number,
  alternatives: Alternative[],
) {
  console.log(`Entrées utilisées :
- Durée de détention : ${period} ans
- Kilométrage annuel : ${km} km
`)

  console.log(
    `\n| Alternative | Coût total (annuel) | Coût d'usage | Coût de possession (annuel) | Émissions totales | Émissions d'usage | Émissions de possession |`,
  )
  console.log(
    `| ----------- | ---------- | ------------ | ------------------ | ----------------- | ----------------- | ----------------------- |`,
  )
  for (const alternative of alternatives) {
    const emissions = alternative.emissions.total.value!
    const emissionsUsage = alternative.emissions.usage.value!
    const emissionsOwnership = alternative.emissions.ownership.value!
    const emissionsUsagePercent = (emissionsUsage / emissions) * 100 || 0
    const emissionsOwnershipPercent =
      (emissionsOwnership / emissions) * 100 || 0
    const costs = alternative.cost.total.value!
    const costsUsage = alternative.cost.usage.value!
    const costsOwnership = alternative.cost.ownership.value!
    const costsUsagePercent = (costsUsage / costs) * 100 || 0
    const costsOwnershipPercent = (costsOwnership / costs) * 100 || 0

    console.log(
      `| ${alternative.title!} | ${Math.round(costs)} € | ${Math.round(costsUsage)} € (${costsUsagePercent.toFixed(
        0,
      )} %) | ${Math.round(costsOwnership)} € (${costsOwnershipPercent.toFixed(
        0,
      )} %) | ${Math.round(emissions)} kgCO2e | ${Math.round(emissionsUsage)} kgCO2e (${emissionsUsagePercent.toFixed(
        0,
      )} %) | ${Math.round(emissionsOwnership)} kgCO2e (${emissionsOwnershipPercent.toFixed(
        0,
      )} %) |`,
    )
  }
  console.log("\n---")
}
