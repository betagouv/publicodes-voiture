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

  const alternatives = {}

  for (const motorisation of motorisations) {
    alternatives[`empreinte . ${motorisation}`] = {
      titre: `Ensemble des véhicules ${motorisation}`,
    }
    alternatives[`coûts . ${motorisation}`] = {
      titre: `Ensemble des véhicules ${motorisation}`,
    }
    for (const gabarit of gabarits) {
      const gabaritTitle =
        alternatives[`voiture . gabarit . ${gabarit}`]?.titre ?? gabarit
      const baseContexte = {
        "voiture . gabarit": `'${gabarit}'`,
        "voiture . motorisation": `'${motorisation}'`,
        // FIXME: could a cleaner solution could be found to use estimated values?
        "voiture . prix d'achat": {
          valeur: "voiture . prix d'achat . estimé",
          contexte: {
            "voiture . gabarit": `'${gabarit}'`,
            "voiture . motorisation": `'${motorisation}'`,
          },
        },
        "voiture . électrique . consommation électricité": {
          valeur: "voiture . électrique . consommation estimée",
          contexte: {
            "voiture . gabarit": `'${gabarit}'`,
          },
        },
      }

      if (motorisation === "électrique") {
        alternatives[`empreinte . ${motorisation} . ${gabarit}`] = {
          titre: `${gabaritTitle} ${motorisation}`,
          unité: "kgCO2eq/an",
          valeur: "empreinte . voiture",
          contexte: baseContexte,
        }
        alternatives[`coûts . ${motorisation} . ${gabarit}`] = {
          titre: `${gabaritTitle} ${motorisation}`,
          unité: "€/an",
          valeur: "coûts . voiture",
          contexte: baseContexte,
        }
      } else {
        alternatives[`empreinte . ${motorisation} . ${gabarit}`] = {
          titre: `Ensemble des ${gabaritTitle} ${motorisation}`,
        }
        alternatives[`coûts . ${motorisation} . ${gabarit}`] = {
          titre: `Ensemble des ${gabaritTitle} ${motorisation}`,
        }
        for (const carburant of carburants) {
          const carburantTitle =
            alternatives[`voiture . thermique . carburant . ${carburant}`]
              ?.titre ?? carburant

          alternatives[
            `empreinte . ${motorisation} . ${gabarit} . ${carburant}`
          ] = {
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
          alternatives[`coûts . ${motorisation} . ${gabarit} . ${carburant}`] =
            {
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

  return alternatives
}
