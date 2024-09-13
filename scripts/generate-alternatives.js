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
    rules[`coûts . ${motorisation}`] = {
      titre: `Ensemble des véhicules ${motorisation}`,
    }
    for (const gabarit of gabarits) {
      const gabaritTitle =
        rules[`voiture . gabarit . ${gabarit}`]?.titre ?? gabarit
      const baseContexte = {
        "voiture . gabarit": `'${gabarit}'`,
        "voiture . motorisation": `'${motorisation}'`,
        "voiture . électrique . consommation électricité": {
          valeur: "voiture . électrique . consommation estimée",
          contexte: {
            "voiture . gabarit": `'${gabarit}'`,
          },
        },
      }

      if (motorisation === "électrique") {
        rules[`empreinte . ${motorisation} . ${gabarit}`] = {
          titre: `${gabaritTitle} ${motorisation}`,
          unité: "kgCO2eq/an",
          valeur: "empreinte . voiture",
          contexte: baseContexte,
        }
        rules[`coûts . ${motorisation} . ${gabarit}`] = {
          titre: `${gabaritTitle} ${motorisation}`,
          unité: "€/an",
          valeur: "coûts . voiture",
          contexte: baseContexte,
        }
      } else {
        rules[`empreinte . ${motorisation} . ${gabarit}`] = {
          titre: `Ensemble des ${gabaritTitle} ${motorisation}`,
        }
        rules[`coûts . ${motorisation} . ${gabarit}`] = {
          titre: `Ensemble des ${gabaritTitle} ${motorisation}`,
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
              "voiture . thermique . consommation carburant": {
                valeur: "voiture . thermique . consommation estimée",
                contexte: {
                  "voiture . gabarit": `'${gabarit}'`,
                  "voiture . motorisation": `'${motorisation}'`,
                  "voiture . thermique . carburant": `'${carburant}'`,
                },
              },
            },
          }
          rules[`coûts . ${motorisation} . ${gabarit} . ${carburant}`] = {
            titre: `${gabaritTitle} ${motorisation} (${carburantTitle})`,
            unité: "€/an",
            valeur: "coûts . voiture",
            contexte: {
              ...baseContexte,
              "voiture . thermique . carburant": `'${carburant}'`,
              "voiture . thermique . consommation carburant": {
                valeur: "voiture . thermique . consommation estimée",
                contexte: {
                  "voiture . gabarit": `'${gabarit}'`,
                  "voiture . motorisation": `'${motorisation}'`,
                  "voiture . thermique . carburant": `'${carburant}'`,
                },
              },
            },
          }
        }
      }
    }
  }
}
