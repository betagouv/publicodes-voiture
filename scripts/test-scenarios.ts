import { CarSimulator, Alternative } from "../src/CarSimulator"

const simulator = new CarSimulator()

// console.time("alternatives")
// simulator.evaluateAlternatives()
// console.timeEnd("alternatives")

const periods_of_detentions = [3, 5.5, 10]
// const periods_of_detentions = [5.5]
const kms = [1000, 7000, 13975, 40000]
// const kms = [13975]

for (const period of periods_of_detentions) {
  for (const km of kms) {
    simulator.setInputs({
      "voiture . durée de détention totale": period,
      "usage . km annuels . connus": true,
      "usage . km annuels . renseignés": km,
    })

    // console.log(`\nEntrées: ${period} ans de détention, ${km} km annuels`)
    // console.log(
    //   `- \`durée de détention\` = ${simulator.evaluateRule("rentabilité passage à l'électrique . durée de détention").value} an`,
    // )
    // console.log(
    //   `- \`km annuels\` = ${simulator.evaluateRule("rentabilité passage à l'électrique . km annuels").value} an`,
    // )

    console.time("evaluate alternatives")
    const alternatives = simulator
      .evaluateAlternatives()
      .sort((a, b) => a.title!.localeCompare(b.title!))
    // .filter((a) => a.size.value === "berline")
    console.timeEnd("evaluate alternatives")

    showMardownTableSummary(
      simulator.getEngine().evaluate("voiture . durée de détention totale")
        .nodeValue as number,
      simulator.getEngine().evaluate("usage . km annuels").nodeValue as number,
      alternatives.filter((a) => a.kind === "car"),
    )
  }
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
  console.log(`| Paramètre | Valeur |`)
  console.log(`| --------- | ----- |`)
  console.log(`| Durée de détention (année) | ${period} |`)
  console.log(`| Kilométrage annuel (km) | ${km} |`)
  console.log("\n<details>\n")
  console.log(
    `<summary>Alternatives (total : ${alternatives.length})</summary>\n`,
  )

  console.log(
    `\n| Alternative | Coût total | Coût d'usage | Coût de consommation (% usage) | Coût de possession | Émissions totales | Émissions d'usage | Émissions de possession | Kilométrage annuel (pour rentabilisé l'élec) | Durée de détention (pour rentabilisé l'élec)| Coût d'achat à rentabiliser (élec) |`,
  )
  console.log(
    `| ----------- | ---------- | ------------ | ------------------ | ----------------- | ----------------- | ----------------------- | ------------------ | ----------------- | ----------------- | -------------------------- |`,
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
    const costConso = alternative.cost.consomption.value!
    const costConsoPercent = (costConso / costsUsage) * 100 || 0
    const costsOwnershipPercent = (costsOwnership / costs) * 100 || 0
    const period = alternative.electricSwitch.period.value
    const km = alternative.electricSwitch.distance.value
    const purchaseCost = alternative.electricSwitch.purchaseCost.value
    const pp = (n: number | null | undefined, unit: string) =>
      n != null ? `${Math.round(n).toLocaleString("fr-FR")} ${unit}` : "N/A"

    console.log(
      `| ${alternative.title!} | ${pp(costs, "€")} | ${pp(costsUsage, "€")} (${costsUsagePercent.toFixed(
        0,
      )} %) | ${pp(costConso, "€")} (${costConsoPercent.toFixed(0)} %) | ${pp(costsOwnership, "€")} (${costsOwnershipPercent.toFixed(
        0,
      )} %) | ${pp(emissions, "kgCO2e")} | ${pp(emissionsUsage, "kgCO2e")} (${emissionsUsagePercent.toFixed(
        0,
      )} %) | ${pp(emissionsOwnership, "kgCO2e")} (${emissionsOwnershipPercent.toFixed(
        0,
      )} %) | ${pp(km, "km")} | ${pp(period, "an")} | ${pp(purchaseCost, "€")} |`,
    )
  }

  console.log("\n</details>\n")
  console.log("\n---")
}
