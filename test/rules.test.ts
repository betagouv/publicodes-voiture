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

  describe("voiture . prix d'achat", () => {
    test("prix par défaut", () => {
      const actual = engine.setSituation({}).evaluate("voiture . prix d'achat")

      expect(actual.nodeValue).toEqual(38000)
      expect(serializeUnit(actual.unit)).toEqual("€")
    })

    test("prix par défaut d'une voiture d'occasion devrait être réduit", () => {
      const actual = engine
        .setSituation({ "voiture . occasion": "oui" })
        .evaluate("voiture . prix d'achat")

      expect(actual.nodeValue).toEqual(14578.563738460001)
      expect(serializeUnit(actual.unit)).toEqual("€")
    })
  })

  describe("coûts . achat amorti", () => {
    test("les divisions par zero ne devrait pas être possible", () => {
      const actual = engine
        .setSituation({ "voiture . durée de détention totale": 0 })
        .evaluate("coûts . achat amorti")

      expect(actual.nodeValue).toEqual(7600)
    })

    test.for([
      [1, 8000],
      [2, 6800],
      [3, 5984],
      [4, 5386],
      [5, 5011],
      [6, 4710],
      [7, 4475],
      [8, 4251],
      [9, 4038],
      [10, 3836],
      [11, 3645],
      [12, 3462],
      [13, 3289],
      [14, 3125],
    ])("valeur de revente au bout de %i an", ([durée, expected]) => {
      const actual = engine
        .setSituation({
          "voiture . prix d'achat": 10000,
          "voiture . durée de détention totale": durée,
        })
        .evaluate("coûts . achat amorti . valeur de revente")

      expect(actual.nodeValue).toBeCloseTo(expected, 0)
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
    test("le coût d'achat à rentabiliser devrait augmenter plus la durée de détention augmente", () => {
      const low = engine
        .setSituation({ "voiture . durée de détention totale": 2 })
        .evaluate(
          "rentabilité passage à l'électrique . variables . coût d'achat électrique",
        ).nodeValue as number

      const high = engine
        .setSituation({ "voiture . durée de détention totale": 10 })
        .evaluate(
          "rentabilité passage à l'électrique . variables . coût d'achat électrique",
        ).nodeValue as number

      expect(low).toBeLessThan(high)
    })

    describe("durée de détention", () => {
      test("par défaut", () => {
        const actual = engine
          .setSituation({})
          .evaluate("rentabilité passage à l'électrique . durée de détention")

        expect(actual.nodeValue).toBeCloseTo(16.5, 0)
        expect(serializeUnit(actual.unit)).toEqual("an")
      })

      test("pour des km annuels deux fois moins important que par défaut (7000 km/an)", () => {
        const actual = engine
          .setSituation({
            "usage . km annuels . connus": "oui",
            "usage . km annuels . renseignés": 7000,
          })
          .evaluate("rentabilité passage à l'électrique . durée de détention")

        expect(actual.nodeValue).toBeCloseTo(29, 0)
        expect(serializeUnit(actual.unit)).toEqual("an")
      })

      test("pour 50 000 km annuels", () => {
        const actual = engine
          .setSituation({
            "usage . km annuels . connus": "oui",
            "usage . km annuels . renseignés": 50000,
          })
          .evaluate("rentabilité passage à l'électrique . durée de détention")

        expect(actual.nodeValue).toBeCloseTo(7, 0)
        expect(serializeUnit(actual.unit)).toEqual("an")
      })

      test("pour des km annuels nuls", () => {
        const actual = engine
          .setSituation({
            "usage . km annuels . connus": "oui",
            "usage . km annuels . renseignés": 0,
          })
          .evaluate("rentabilité passage à l'électrique . durée de détention")

        // Même sans rouler, les coûts de possessions sont toujours présents et
        // moins élevés pour une voiture électrique (assurance moins chère,
        // moins d'entretien, etc.)
        expect(actual.nodeValue).toBeCloseTo(60, 0)
      })

      // NOTE: pour l'instant, le coût d'achat total dépend de la durée de
      // possession. A voir si cela pose un réel problème (cf. note de la règle
      // `rentabilité passage à l'électrique . durée de détention`).
      test("augmenter la durée de détention ne devrait pas impacter le calcul", () => {
        const low = engine
          .shallowCopy()
          .setSituation({
            "voiture . durée de détention totale": 2,
          })
          .evaluate("rentabilité passage à l'électrique . durée de détention")
          .nodeValue as number

        const high = engine
          .shallowCopy()
          .setSituation({
            "voiture . durée de détention totale": 8,
          })
          .evaluate("rentabilité passage à l'électrique . durée de détention")
          .nodeValue as number

        expect(low).toBeCloseTo(high, 0)
      })
    })

    describe("km annuels", () => {
      test("par défaut", () => {
        const actual = engine
          .setSituation({})
          .evaluate("rentabilité passage à l'électrique . km annuels")

        expect(actual.nodeValue).toBeCloseTo(41969.6, 0)
        expect(serializeUnit(actual.unit)).toEqual("km/an")
      })

      test("augmenter la durée de détention doit diminuer les km annuels", () => {
        const low = engine
          .setSituation({ "voiture . durée de détention totale": 2 })
          .evaluate("rentabilité passage à l'électrique . km annuels")
          .nodeValue as number

        const high = engine
          .setSituation({ "voiture . durée de détention totale": 10 })
          .evaluate("rentabilité passage à l'électrique . km annuels")
          .nodeValue as number

        expect(low).toBeGreaterThan(high)
      })

      test("augmenter les kilomètres annuels ne devrait pas impacter la rentabilité", () => {
        const low = engine
          .shallowCopy()
          .setSituation({
            "usage . km annuels . connus": "oui",
            "usage . km annuels . renseignés": 5000,
          })
          .evaluate("rentabilité passage à l'électrique . km annuels")
          .nodeValue as number

        const high = engine
          .shallowCopy()
          .setSituation({
            "usage . km annuels . connus": "oui",
            "usage . km annuels . renseignés": 50000,
          })
          .evaluate("rentabilité passage à l'électrique . km annuels")
          .nodeValue as number

        expect(low).toBeCloseTo(high, 0)
      })
    })
  })
})

function evaluateCostAndEmissions(engine: Engine<RuleName>) {
  return {
    coûts: engine.evaluate("coûts").nodeValue as number,
    empreinte: engine.evaluate("empreinte").nodeValue as number,
  }
}
