import { describe, expect, test } from "vitest"
import { SimulateurVoitureEngine } from "../src/SimulateurVoitureEngine"

describe("SimulateurVoitureEngine", () => {
  describe("new SimulateurVoitureEngine()", () => {
    test("should return an instance of AidesVeloEngine with corrects rules parsed", () => {
      const engine = new SimulateurVoitureEngine()
      expect(engine).toBeInstanceOf(SimulateurVoitureEngine)

      const parsedRules = engine.getEngine().getParsedRules()
      expect(parsedRules["coûts"]).toBeDefined()
      expect(parsedRules["empreinte"]).toBeDefined()
    })
  })

  const globalTestEngine = new SimulateurVoitureEngine()

  describe("setInputs()", () => {
    test("should correctly set the engine's situation", () => {
      const engine = globalTestEngine.shallowCopy()
      engine.setInputs({ "voiture . gabarit": "moyenne" })

      const situation = engine.getEngine().getSituation()
      expect(situation["voiture . gabarit"]).toEqual("'moyenne'")
    })

    test("should correctly handle undefined values", () => {
      const engine = globalTestEngine.shallowCopy()
      engine.setInputs({ "voiture . gabarit": undefined })

      const situation = engine.getEngine().getSituation()
      expect(situation["voiture . gabarit"]).toBeUndefined()
    })
  })
})
