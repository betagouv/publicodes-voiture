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
      const gabaritTitle =
        rules[`voiture . gabarit . ${gabarit}`]?.titre ?? gabarit
      const baseContexte = {
        "voiture . gabarit": `'${gabarit}'`,
        "voiture . motorisation": `'${motorisation}'`,
        // Needed to force the use of the 'voiture . prix d'achat . estimé'
        "voiture . prix d'achat": "non",
        // Needed to force the use of the 'voiture . thermique . consommation . estimée'
        "voiture . thermique . consommation": "non",
      }

      if (motorisation !== "électrique") {
        rules[`empreinte . ${motorisation} . ${gabarit}`] = {
          titre: `Ensemble des ${gabarit} ${motorisation}`,
        }
        rules[`coût . ${motorisation} . ${gabarit}`] = {
          titre: `Ensemble des ${gabarit} ${motorisation}`,
        }
        for (const carburant of carburants) {
          const carburantTitle =
            rules[`voiture . thermique . carburant . ${carburant}`]?.titre ??
            carburant

          rules[`empreinte . ${motorisation} . ${gabarit} . ${carburant}`] = {
            titre: `${gabaritTitle} ${motorisation} (${carburantTitle})`,
            unité: "kgCO2eq/an",
            valeur: "empreinte . voiture",
            contexte: {
              ...baseContexte,
              "voiture . thermique . carburant": `'${carburant}'`,
            },
          }
          rules[`coût . ${motorisation} . ${gabarit} . ${carburant}`] = {
            titre: `${gabaritTitle} ${motorisation} (${carburantTitle})`,
            unité: "€/an",
            valeur: "coût . voiture",
            contexte: {
              ...baseContexte,
              "voiture . thermique . carburant": `'${carburant}'`,
            },
          }
        }
      } else {
        rules[`empreinte . ${motorisation} . ${gabarit}`] = {
          titre: `${gabaritTitle} ${motorisation}`,
          unité: "kgCO2eq/an",
          valeur: "empreinte . voiture",
          contexte: baseContexte,
        }
        rules[`coût . ${motorisation} . ${gabarit}`] = {
          titre: `${gabaritTitle} ${motorisation}`,
          unité: "€/an",
          valeur: "coût . voiture",
          contexte: baseContexte,
        }
      }
    }
  }
}
