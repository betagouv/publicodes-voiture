import csv from "csv-parser"
import fs from "fs"

// TODO: automatically generate this type from the compilation of the Publicodes model
type PublicodesMotorisation =
  | "thermique (essence)"
  | "thermique (diesel)"
  | "électrique"
  | "hybride (HR)"
  | "hybride (HNR)"

type PublicodesSizes = "petite" | "moyenne" | "SUV" | "berline" | "VUL"

type Energie =
  | "ESSENCE"
  | "GAZOLE"
  | "ELECTRIC"
  | "ELEC+ESSENC HR"
  | "ELEC+GAZOLE HR"
  | "ESS+ELEC HNR"
  | "ESS+G.P.L."
  | "GAZ+ELEC HNR"
  | "SUPERETHANOL"

type Carrosserie =
  | "BERLINE"
  | "BREAK"
  | "CABRIOLET"
  | "COMBISPACE"
  | "COUPE"
  | "MINIBUS"
  | "MINISPACE"
  | "MONOSPACE"
  | "MONOSPACE COMPACT"
  | "TS TERRAINS/CHEMINS"

type Gamme =
  | "ECONOMIQUE"
  | "INFERIEURE"
  | "LUXE"
  | "MOYENNE INFERIEURE"
  | "MOYENNE SUPERIEURE"
  | "SUPERIEURE"

type Car = {
  Energie: Energie
  Carrosserie: Carrosserie
  Gamme: Gamme
  Modèle: string
  "Poids à vide": number
  "Conso vitesse mixte Min": number
  "Conso vitesse mixte Max": number
  "Prix véhicule": number
}

const getMotorisation = (energie: Energie): PublicodesMotorisation | null => {
  if (energie === "ELECTRIC") {
    return "électrique"
  } else if (energie === "ELEC+ESSENC HR") {
    return "hybride (HR)"
  } else if (energie?.includes("HNR")) {
    return "hybride (HNR)"
  } else if (energie === "GAZOLE") {
    return "thermique (diesel)"
  } else if (energie === "ESSENCE" || energie === "SUPERETHANOL") {
    return "thermique (essence)"
  } else {
    return null
  }
}

/**
 * Copied from https://github.com/incubateur-ademe/nosgestesclimat/blob/d0ffc493557b1f3983cd4d26463915a1020c1a32/scripts/voiture/getConsoCarLabelling.ts#L74C1-L111C2
 */
const getSize = (
  Gamme: Gamme,
  Carosserie: Carrosserie,
  poids: number,
  motorisation: PublicodesMotorisation,
  prix: number,
): PublicodesSizes | null => {
  const petiteTreshold =
    motorisation === "électrique"
      ? 1700
      : motorisation === "hybride (HR)"
        ? 1550
        : 1400
  const moyenneTreshold =
    motorisation === "électrique"
      ? 2000
      : motorisation === "hybride (HR)"
        ? 1750
        : 1600
  if (Carosserie === "COMBISPACE") {
    return "VUL"
  } else if (Gamme === "LUXE" || Gamme === "SUPERIEURE") {
    if (
      poids >= moyenneTreshold &&
      prix <= 100000 &&
      // Gamme !== "LUXE" &&
      Carosserie !== "CABRIOLET" &&
      Carosserie !== "COUPE"
    ) {
      return "SUV"
    } else {
      return null
    }
  } else if (poids < petiteTreshold) {
    return "petite"
  } else if (poids >= petiteTreshold && poids < moyenneTreshold) {
    return "moyenne"
  } else if (poids >= moyenneTreshold) {
    return "berline"
  } else {
    return null
  }
}

const data: Car[] = []

fs.createReadStream("./scripts/data/carlabelling/ademe-car-labelling.csv")
  .pipe(csv())
  .on("data", (row) => {
    const car = {
      ...row,
      "Poids à vide": parseFloat(row["Poids à vide"]),
      "Prix véhicule": parseFloat(row["Prix véhicule"]),
    }
    data.push(car)
  })
  .on("end", () => {
    console.log("CSV file successfully processed")
    const results = data.reduce(
      (acc, car) => {
        const {
          "Prix véhicule": prix,
          "Poids à vide": poids,
          Gamme,
          Energie,
        } = car

        const motorisation = getMotorisation(Energie)
        if (!motorisation) {
          return acc
        }
        const size = getSize(Gamme, car.Carrosserie, poids, motorisation, prix)
        if (!size) {
          return acc
        }
        // NOTE: nous faisons l'hypothèse que le prix d'achat réel est 10%
        // inférieur au prix catalogue (selon le SGPE).
        acc.prixParPoids[size][motorisation] += prix * 0.9
        acc.effectifParPoids[size][motorisation] += 1

        return acc
      },
      {
        prixParPoids: {
          petite: {
            "thermique (essence)": 0,
            "thermique (diesel)": 0,
            électrique: 0,
            "hybride (HR)": 0,
            "hybride (HNR)": 0,
          },
          moyenne: {
            "thermique (essence)": 0,
            "thermique (diesel)": 0,
            électrique: 0,
            "hybride (HR)": 0,
            "hybride (HNR)": 0,
          },
          VUL: {
            "thermique (essence)": 0,
            "thermique (diesel)": 0,
            électrique: 0,
            "hybride (HR)": 0,
            "hybride (HNR)": 0,
          },
          berline: {
            "thermique (essence)": 0,
            "thermique (diesel)": 0,
            électrique: 0,
            "hybride (HR)": 0,
            "hybride (HNR)": 0,
          },
          SUV: {
            "thermique (essence)": 0,
            "thermique (diesel)": 0,
            électrique: 0,
            "hybride (HR)": 0,
            "hybride (HNR)": 0,
          },
        },
        effectifParPoids: {
          petite: {
            "thermique (essence)": 0,
            "thermique (diesel)": 0,
            électrique: 0,
            "hybride (HR)": 0,
            "hybride (HNR)": 0,
          },
          moyenne: {
            "thermique (essence)": 0,
            "thermique (diesel)": 0,
            électrique: 0,
            "hybride (HR)": 0,
            "hybride (HNR)": 0,
          },
          VUL: {
            "thermique (essence)": 0,
            "thermique (diesel)": 0,
            électrique: 0,
            "hybride (HR)": 0,
            "hybride (HNR)": 0,
          },
          berline: {
            "thermique (essence)": 0,
            "thermique (diesel)": 0,
            électrique: 0,
            "hybride (HR)": 0,
            "hybride (HNR)": 0,
          },
          SUV: {
            "thermique (essence)": 0,
            "thermique (diesel)": 0,
            électrique: 0,
            "hybride (HR)": 0,
            "hybride (HNR)": 0,
          },
        },
      },
    )

    console.log("\nPrix moyen cat:")
    console.table(
      Object.entries(results.prixParPoids).flatMap(([poids, prix]) => {
        return Object.entries(prix).map(([motorisation, prix]) => ({
          poids,
          motorisation,
          prix:
            Math.round(
              prix / results.effectifParPoids[poids][motorisation],
            ).toLocaleString("fr-FR") + " €",
          nb: results.effectifParPoids[poids][motorisation],
        }))
      }),
      ["poids", "motorisation", "prix", "nb"],
    )
  })
