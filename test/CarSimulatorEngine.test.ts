import { describe, expect, test } from "vitest"
import { CarSimulatorEngine } from "../src/CarSimulatorEngine"

describe("CarSimulatorEngine", () => {
  describe("new CarSimulatorEngine()", () => {
    test("should return an instance of AidesVeloEngine with corrects rules parsed", () => {
      const engine = new CarSimulatorEngine()
      expect(engine).toBeInstanceOf(CarSimulatorEngine)

      const parsedRules = engine.getEngine().getParsedRules()
      expect(parsedRules["coûts"]).toBeDefined()
      expect(parsedRules["empreinte"]).toBeDefined()
    })
  })

  const globalTestEngine = new CarSimulatorEngine()

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

  describe("evaluateCar()", () => {
    test("should have default values", () => {
      const engine = globalTestEngine.shallowCopy()
      const carInfos = engine.evaluateCar()

      expect(carInfos.cost).toBeCloseTo(6370, 0)
      expect(carInfos.emissions).toBeCloseTo(3022.8, 0)
      expect(carInfos.size).toEqual({
        nodeValue: "berline",
        title: "Berline",
      })
      expect(carInfos.motorisation).toEqual({
        nodeValue: "thermique",
        title: "Thermique",
      })
      expect(carInfos.fuel).toEqual({
        nodeValue: "essence E5 ou E10",
        title: "Essence",
      })
    })
  })
})
