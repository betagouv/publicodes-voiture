/**
 * Script to generate all the possible combinations of carburants, gabarits and
 * motorisations
 */

const ALTERNATIVES_VOITURE_NAMESPACE = "alternatives . acheter voiture"

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

  const alternatives = {
    "alternatives . acheter voiture": {
      titre: "Acheter une nouvelle voiture",
    },
  }

  for (const gabarit of gabarits) {
    const gabaritTitle =
      rules[`voiture . gabarit . ${gabarit}`]?.titre ?? gabarit

    alternatives[`${ALTERNATIVES_VOITURE_NAMESPACE} . ${gabarit}`] = {
      titre: gabaritTitle,
    }

    for (const motorisation of motorisations) {
      const motorisationTitle =
        rules[`voiture . motorisation . ${motorisation}`]?.titre ?? motorisation

      alternatives[
        `${ALTERNATIVES_VOITURE_NAMESPACE} . ${gabarit} . ${motorisation}`
      ] = {
        titre: motorisationTitle,
      }
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
        alternatives[
          `${ALTERNATIVES_VOITURE_NAMESPACE} . ${gabarit} . ${motorisation}`
        ] = {
          titre: `${gabaritTitle} ${motorisationTitle}`,
        }
        alternatives[
          `${ALTERNATIVES_VOITURE_NAMESPACE} . ${gabarit} . ${motorisation} . empreinte`
        ] = {
          titre: "Empreinte CO2e",
          unité: "kgCO2e/an",
          valeur: "empreinte",
          contexte: baseContexte,
        }
        alternatives[
          `${ALTERNATIVES_VOITURE_NAMESPACE} . ${gabarit} . ${motorisation} . coûts`
        ] = {
          titre: "Coûts annuels",
          unité: "€/an",
          valeur: "coûts",
          contexte: baseContexte,
        }
      } else {
        for (const carburant of carburants) {
          const carburantTitle =
            rules[`voiture . thermique . carburant . ${carburant}`]?.titre ??
            carburant

          alternatives[
            `${ALTERNATIVES_VOITURE_NAMESPACE} . ${gabarit} . ${motorisation} . ${carburant}`
          ] = {
            titre: `${gabaritTitle} ${motorisationTitle} (${carburantTitle})`,
          }

          alternatives[
            `${ALTERNATIVES_VOITURE_NAMESPACE} . ${gabarit} . ${motorisation} . ${carburant} . empreinte`
          ] = {
            titre: "Empreinte CO2e",
            unité: "kgCO2e/an",
            valeur: "empreinte",
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
          alternatives[
            `${ALTERNATIVES_VOITURE_NAMESPACE} . ${gabarit} . ${motorisation} . ${carburant} . coûts`
          ] = {
            titre: "Coûts annuels",
            unité: "€/an",
            valeur: "coûts",
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
