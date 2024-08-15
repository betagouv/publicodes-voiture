/**
 * Script to generate all the possible combinations of carburants, gabarits and
 * motorisations
 */

export default function generateAlternatives(rules) {
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
    rules[`coût . ${motorisation}`] = {
      titre: `Ensemble des véhicules ${motorisation}`,
    }
    for (const gabarit of gabarits) {
      const contexteBaseEmission = {
        "ngc . transport . voiture . utilisateur": "'propriétaire'",
        "ngc . transport . voiture . gabarit": `'${gabarit}'`,
        "ngc . transport . voiture . motorisation": `'${motorisation}'`,
        "ngc . transport . voiture . km": "usage . km annuels",
        "ngc . transport . voiture . voyageurs": 1,
        "ngc . transport . voiture . thermique . consommation aux 100":
          "voiture . thermique . consommation",
      }

      const contexteBaseCost = {
        "voiture . gabarit": `'${gabarit}'`,
        "voiture . motorisation": `'${motorisation}'`,
        // We need to disable the rule to use the 'voiture . prix d'achat . estimé' instead
        "voiture . prix d'achat": "non",
      }

      if (motorisation !== "électrique") {
        rules[`empreinte . ${motorisation} . ${gabarit}`] = {
          titre: `Ensemble des ${gabarit} ${motorisation}`,
        }
        rules[`coût . ${motorisation} . ${gabarit}`] = {
          titre: `Ensemble des ${gabarit} ${motorisation}`,
        }
        for (const carburant of carburants) {
          rules[`empreinte . ${motorisation} . ${gabarit} . ${carburant}`] = {
            titre: `${gabarit} ${motorisation} (${carburant})`,
            unité: "kgCO2eq/an",
            valeur: "ngc . transport . voiture",
            contexte: {
              ...contexteBaseEmission,
              "ngc . transport . voiture . thermique . carburant": `'${carburant}'`,
            },
          }
          rules[`coût . ${motorisation} . ${gabarit} . ${carburant}`] = {
            titre: `${gabarit} ${motorisation} (${carburant})`,
            unité: "€/an",
            valeur: "coût . voiture",
            contexte: {
              ...contexteBaseCost,
              "voiture . thermique . carburant": `'${carburant}'`,
            },
          }
        }
      } else {
        rules[`empreinte . ${motorisation} . ${gabarit}`] = {
          titre: `${gabarit} ${motorisation}`,
          unité: "kgCO2eq/an",
          valeur: "ngc . transport . voiture",
          contexte: contexteBaseEmission,
        }
        rules[`coût . ${motorisation} . ${gabarit}`] = {
          titre: `${gabarit} ${motorisation}`,
          unité: "€/an",
          valeur: "coût . voiture",
          contexte: contexteBaseCost,
        }
      }
    }
  }
}
