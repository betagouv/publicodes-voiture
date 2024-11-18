import Engine, { serializeUnit } from "publicodes"
import rules, { RuleName } from "../publicodes-build"
import { expect, test, describe } from "vitest"

describe("Règles", () => {
  const engine = new Engine<RuleName>(rules, {
    logger: {
      log: () => {},
      warn: () => {},
      error: (message: string) => console.error(message),
    },
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
})

function evaluateCostAndEmissions(engine: Engine<RuleName>) {
  return {
    coûts: engine.evaluate("coûts . voiture").nodeValue as number,
    empreinte: engine.evaluate("empreinte . voiture").nodeValue as number,
  }
}
