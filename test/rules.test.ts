import Engine, { serializeUnit } from "publicodes"
import rules, { RuleName } from "../publicodes-build"
import { expect, test, describe, beforeEach } from "vitest"

describe("Règles", () => {
  let engine = new Engine<RuleName>(rules, {
    logger: {
      log: () => {},
      warn: () => {},
      error: (message: string) => console.error(message),
    },
  })

  beforeEach(() => {
    engine = engine.shallowCopy()
  })

  describe("technique", () => {
    test("une évaluation doit retourner la même valeur que celle renseignée dans la situation", () => {
      const actual = engine.shallowCopy().setSituation({
        "voiture . motorisation": "'électrique'",
      })

      expect(actual.getSituation()["voiture . motorisation"]).toEqual(
        "'électrique'",
      )
      expect(actual.evaluate("voiture . motorisation").nodeValue).toEqual(
        "électrique",
      )
    })
  })

  describe("coûts . coûts de possession . achat amorti", () => {
    test("les divisions par zero ne devrait pas être possible", () => {
      const actual = engine
        .setSituation({ "voiture . durée de détention totale": 0 })
        .evaluate("coûts . coûts de possession . achat amorti")

      expect(actual.nodeValue).toEqual(30400)
    })
  })

  describe("voiture . prix d'achat", () => {
    test("prix par défaut", () => {
      const actual = engine.setSituation({}).evaluate("voiture . prix d'achat")

      expect(actual.nodeValue).toEqual(38000)
      expect(serializeUnit(actual.unit)).toEqual("€")
    })

    test("prix par défaut d'une voiture d'occasion devrait être réduit de 80%", () => {
      const actual = engine
        .setSituation({ "voiture . occasion": "oui" })
        .evaluate("voiture . prix d'achat")

      expect(actual.nodeValue).toEqual(7600)
      expect(serializeUnit(actual.unit)).toEqual("€")
    })
  })

  // NOTE: we should probably use property-based testing here to have a better
  // coverage of the values.
  describe("propriétés générales", () => {
    test("l'augmentation de la distance parcourue devrait augmenter les coûts et l'empreinte", () => {
      const petiteDistance = evaluateCostAndEmissions(
        engine.setSituation({
          "usage . km annuels . connus": "oui",
          "usage . km annuels . renseignés": 5000,
        }),
      )
      const grandeDistance = evaluateCostAndEmissions(
        engine.setSituation({
          "usage . km annuels . connus": "oui",
          "usage . km annuels . renseignés": 20000,
        }),
      )

      expect(petiteDistance.coûts).toBeLessThan(grandeDistance.coûts)
      expect(petiteDistance.empreinte).toBeLessThan(grandeDistance.empreinte)
    })

    test("l'augmentation de la consommmation devrait augmenter les coûts et l'empreinte", () => {
      const grandeConso = evaluateCostAndEmissions(
        engine.setSituation({
          "voiture . thermique . consommation carburant": 7,
        }),
      )

      const petiteConso = evaluateCostAndEmissions(
        engine.setSituation({
          "voiture . thermique . consommation carburant": 2,
        }),
      )

      expect(petiteConso.coûts).toBeLessThan(grandeConso.coûts)
      expect(petiteConso.empreinte).toBeLessThan(grandeConso.empreinte)
    })
  })

  describe("rentabilité passage à l'électrique", () => {
    describe("durée de possession", () => {
      test("par défaut", () => {
        const actual = engine
          .setSituation({})
          .evaluate("rentabilité passage à l'électrique . durée de possession")

        expect(actual.nodeValue).toBeCloseTo(44.6, 0)
        expect(serializeUnit(actual.unit)).toEqual("an")
      })
    })

    // describe("km annuels", () => {})
  })
})

function evaluateCostAndEmissions(engine: Engine<RuleName>) {
  return {
    coûts: engine.evaluate("coûts").nodeValue as number,
    empreinte: engine.evaluate("empreinte").nodeValue as number,
  }
}
