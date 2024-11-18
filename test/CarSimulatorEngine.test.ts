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

  describe("evaluateRule()", () => {
    test("default values should be applicable", () => {
      const engine = globalTestEngine.shallowCopy()

      expect(engine.evaluateRule("coûts . voiture").isApplicable).toBeTruthy()
      expect(
        engine.evaluateRule("empreinte . voiture").isApplicable,
      ).toBeTruthy()
      expect(engine.evaluateRule("voiture . gabarit").isApplicable).toBeTruthy()
      expect(
        engine.evaluateRule("voiture . motorisation").isApplicable,
      ).toBeTruthy()
      expect(
        engine.evaluateRule("voiture . thermique . carburant").isApplicable,
      ).toBeTruthy()
    })

    test("should return false for undefined default values", () => {
      const engine = globalTestEngine.shallowCopy()

      expect(
        engine.evaluateRule("usage . km annuels . calculés").isApplicable,
      ).toBeFalsy()
      expect(
        engine.evaluateRule("voiture . électrique . consommation électricité")
          .isApplicable,
      ).toBeFalsy()
    })

    test("should correctly handle conditionals from the inputs", () => {
      const engine = globalTestEngine.shallowCopy()

      expect(
        engine.evaluateRule("usage . km annuels . calculés").isApplicable,
      ).toBeFalsy()
      engine.setInputs({ "usage . km annuels . connus": false })
      expect(
        engine.evaluateRule("usage . km annuels . calculés").isApplicable,
      ).toBeTruthy()
    })
  })

  describe("evaluateCar()", () => {
    test("should have default values", () => {
      const engine = globalTestEngine.shallowCopy()
      const carInfos = engine.evaluateCar()

      expect(carInfos.cost.value).toBeCloseTo(6370, 0)
      expect(carInfos.emissions.value).toBeCloseTo(3022.8, 0)
      expect(carInfos.size).toEqual({
        value: "berline",
        title: "Berline",
        isApplicable: true,
        isEnumValue: true,
      })
      expect(carInfos.motorisation).toEqual({
        value: "thermique",
        title: "Thermique",
        isApplicable: true,
        isEnumValue: true,
      })
      expect(carInfos.fuel).toEqual({
        value: "essence E5 ou E10",
        title: "Essence",
        isApplicable: true,
        isEnumValue: true,
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

      expect(carInfos.cost.value).toBeGreaterThan(0)
      expect(carInfos.emissions.value).toBeGreaterThan(0)
      expect(carInfos.size).toEqual({
        value: "petite",
        title: "Citadine",
        isApplicable: true,
        isEnumValue: true,
      })
      expect(carInfos.motorisation).toEqual({
        value: "hybride",
        title: "Hybride",
        isApplicable: true,
        isEnumValue: true,
      })
      expect(carInfos.fuel).toEqual({
        value: "essence E85",
        title: "Essence (E85)",
        isApplicable: true,
        isEnumValue: true,
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
    })
  })
})
