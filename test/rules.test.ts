import Engine, { serializeUnit } from "publicodes"
import rules, { RuleName } from "../publicodes-build"
import { expect, test, describe } from "vitest"

describe("Règles", () => {
  const engine = new Engine<RuleName>(rules)

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
})
