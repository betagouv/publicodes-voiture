/**
 * Script to generate all the combinations of the carbon emissions
 */

export default function generateCombinations(rules) {
  const carburants = Object.keys(rules).flatMap((key) => {
    if (
      key.startsWith("voiture . thermique . carburant") &&
      key !== "voiture . thermique . carburant"
    ) {
      const splittedKey = key.split(" . ")
      return [splittedKey[splittedKey.length - 1]]
    }
    return []
  })
  const gabarits = Object.keys(rules).flatMap((key) => {
    if (key.startsWith("voiture . gabarit") && key !== "voiture . gabarit") {
      const splittedKey = key.split(" . ")
      return [splittedKey[splittedKey.length - 1]]
    }
    return []
  })
  const motorisations = Object.keys(rules).flatMap((key) => {
    if (
      key.startsWith("voiture . motorisation") &&
      key !== "voiture . motorisation"
    ) {
      const splittedKey = key.split(" . ")
      return [splittedKey[splittedKey.length - 1]]
    }
    return []
  })

  for (const motorisation of motorisations) {
    rules[`empreinte . ${motorisation}`] = {
      titre: `Ensemble des véhicules ${motorisation}`,
    }
    for (const gabarit of gabarits) {
      if (motorisation !== "électrique") {
        rules[`empreinte . ${motorisation} . ${gabarit}`] = {
          titre: `Ensemble des ${gabarit} ${motorisation}`,
        }
        for (const carburant of carburants) {
          rules[`empreinte . ${motorisation} . ${gabarit} . ${carburant}`] = {
            titre: `${gabarit} ${motorisation} (${carburant})`,
            unité: "kgCO2eq/an/personne",
            valeur: "ngc . transport . voiture",
            contexte: {
              "ngc . transport . voiture . utilisateur": "'propriétaire'",
              "ngc . transport . voiture . gabarit": `\'${gabarit}\'`,
              "ngc . transport . voiture . motorisation": `'${motorisation}'`,
              "ngc . transport . voiture . thermique . carburant": `'${carburant}'`,
              "ngc . transport . voiture . km": "usage . distance totale",
              "ngc . transport . voiture . voyageurs": 1,
            },
          }
        }
      } else {
        rules[`empreinte . ${motorisation} . ${gabarit}`] = {
          titre: `${gabarit} ${motorisation}`,
          unité: "kgCO2eq/an/personne",
          valeur: "ngc . transport . voiture",
          contexte: {
            "ngc . transport . voiture . utilisateur": "'propriétaire'",
            "ngc . transport . voiture . gabarit": `'${gabarit}'`,
            "ngc . transport . voiture . motorisation": `'${motorisation}'`,
            "ngc . transport . voiture . km": "usage . distance totale",
            "ngc . transport . voiture . voyageurs": 1,
          },
        }
      }
    }
  }
}
