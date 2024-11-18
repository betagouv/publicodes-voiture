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

    test("returned values should match with the inputs", () => {
      const engine = globalTestEngine.shallowCopy()
      const carInfos = engine
        .setInputs({
          "voiture . gabarit": "petite",
          "voiture . motorisation": "hybride",
          "voiture . thermique . carburant": "essence E85",
        })
        .evaluateCar()

      expect(carInfos.cost).toBeGreaterThan(0)
      expect(carInfos.emissions).toBeGreaterThan(0)
      expect(carInfos.size).toEqual({
        nodeValue: "petite",
        title: "Citadine",
      })
      expect(carInfos.motorisation).toEqual({
        nodeValue: "hybride",
        title: "Hybride",
      })
      expect(carInfos.fuel).toEqual({
        nodeValue: "essence E85",
        title: "Essence (E85)",
      })
    })

    test("should be cached according to the inputs", async () => {
      const engine = globalTestEngine.shallowCopy()

      engine.setInputs({ "voiture . gabarit": "petite" })
      let firstEval = new Date().getTime()
      engine.evaluateCar()
      firstEval = new Date().getTime() - firstEval

      let secondEval = new Date().getTime()
      engine.evaluateCar()
      secondEval = new Date().getTime() - secondEval

      engine.setInputs({ "voiture . gabarit": "moyenne" })
      let thirdEval = new Date().getTime()
      engine.evaluateCar()
      thirdEval = new Date().getTime() - thirdEval

      // TODO: Do we expect the cache to be done according the situation value
      // instead of resetting at each new setSitutation call (as it is done
      // now)?
      //
      // engine.setInputs({ "voiture . gabarit": "moyenne" })
      // let fourthEval = new Date().getTime()
      // engine.evaluateCar()
      // fourthEval = new Date().getTime() - fourthEval
      // expect(fourthEval).toBeCloseTo(0, 0)

      expect(secondEval).toBeLessThan(firstEval)
      // Should be close to 0 because the cache is used
      expect(secondEval).toBeCloseTo(0, 0)
      expect(thirdEval).toBeGreaterThan(secondEval)
      // Should have the same order of magnitude
      expect(thirdEval / 10).toBeCloseTo(firstEval / 10, 0)
    })
  })
})
