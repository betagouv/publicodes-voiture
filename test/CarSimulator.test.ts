import { describe, expect, test } from "vitest"
import { CarSimulator } from "../src/CarSimulator"
import personas from "../src/personas"

describe("CarSimulator", () => {
  describe("new CarSimulator()", () => {
    test("should return an instance of AidesVeloEngine with corrects rules parsed", () => {
      const engine = new CarSimulator()
      expect(engine).toBeInstanceOf(CarSimulator)

      const parsedRules = engine.getEngine().getParsedRules()
      expect(parsedRules["coûts"]).toBeDefined()
      expect(parsedRules["empreinte"]).toBeDefined()
    })
  })

  const globalTestEngine = new CarSimulator()

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

    test("shouldn't overwrite by default", () => {
      const engine = globalTestEngine.shallowCopy()

      expect(engine.getInputs()).toEqual({})

      engine.setInputs({ "voiture . gabarit": "SUV" })
      expect(engine.getInputs()).toEqual({ "voiture . gabarit": "SUV" })

      engine.setInputs({ "voiture . cible . borne de recharge": false })
      expect(engine.getInputs()).toEqual({
        "voiture . gabarit": "SUV",
        "voiture . cible . borne de recharge": false,
      })

      engine.setInputs({ "voiture . gabarit": undefined })
      expect(engine.getInputs()).toEqual({
        "voiture . cible . borne de recharge": false,
      })

      engine.setInputs({ "voiture . cible . borne de recharge": true })
      expect(engine.getInputs()).toEqual({
        "voiture . cible . borne de recharge": true,
      })
    })

    test("should correctly overwrite when requested", () => {
      const engine = globalTestEngine.shallowCopy()

      expect(engine.getInputs()).toEqual({})

      engine.setInputs({ "voiture . gabarit": "SUV" })
      expect(engine.getInputs()).toEqual({ "voiture . gabarit": "SUV" })

      engine.setInputs(
        { "voiture . cible . borne de recharge": false },
        {
          overwrite: true,
        },
      )
      expect(engine.getInputs()).toEqual({
        "voiture . cible . borne de recharge": false,
      })
    })
  })

  describe("evaluateRule()", () => {
    test("default values should be applicable", () => {
      const engine = globalTestEngine.shallowCopy()

      expect(engine.evaluateRule("coûts").isApplicable).toBeTruthy()
      expect(engine.evaluateRule("empreinte").isApplicable).toBeTruthy()
      expect(engine.evaluateRule("voiture . gabarit").isApplicable).toBeTruthy()
      expect(
        engine.evaluateRule("voiture . motorisation").isApplicable,
      ).toBeTruthy()
      expect(
        engine.evaluateRule("voiture . thermique . carburant").isApplicable,
      ).toBeTruthy()
      expect(engine.evaluateRule("voiture . occasion").isApplicable)
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

    test("should correctly handle enum values", () => {
      const engine = globalTestEngine.shallowCopy()

      expect(engine.evaluateRule("voiture . gabarit").isEnumValue).toBeTruthy()
      expect(
        engine.evaluateRule("voiture . motorisation").isEnumValue,
      ).toBeTruthy()
      expect(
        engine.evaluateRule("voiture . thermique . carburant").isEnumValue,
      ).toBeTruthy()
      expect(engine.evaluateRule("voiture . occasion").isEnumValue).toBeFalsy()
      expect(
        engine.evaluateRule("voiture . prix d'achat").isEnumValue,
      ).toBeFalsy()
      expect(engine.evaluateRule("voiture").isEnumValue).toBeFalsy()
    })
  })

  describe("evaluateCar()", () => {
    describe("personas", () => {
      const simulator = new CarSimulator()

      Object.values(personas).forEach((persona) => {
        test(persona.titre, () => {
          const evaluatedCar = simulator
            .shallowCopy()
            .setSituation(persona.situation)
            .evaluateCar()

          expect(evaluatedCar.emissions.value).toEqual(persona["empreinte"])
          expect(evaluatedCar.cost.value).toEqual(persona["coûts"])
        })
      })
    })

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

    test("should have empty fuel value for electric cars", () => {
      const engine = globalTestEngine.shallowCopy()
      const carInfos = engine
        .setInputs({
          "voiture . motorisation": "électrique",
        })
        .evaluateCar()

      expect(carInfos.cost.value).toBeGreaterThan(0)
      expect(carInfos.emissions.value).toBeGreaterThan(0)
      expect(carInfos.size).toEqual({
        value: "berline",
        title: "Berline",
        isApplicable: true,
        isEnumValue: true,
      })
      expect(carInfos.motorisation).toEqual({
        value: "électrique",
        title: "Électrique",
        isApplicable: true,
        isEnumValue: true,
      })
      expect(carInfos.fuel).toBeUndefined()
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
      // engine.updateInputs({ "voiture . gabarit": "moyenne" })
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

  describe("evaluateAlternatives()", () => {
    test("should return all possible alternatives with default values", () => {
      const engine = globalTestEngine.shallowCopy()
      const alternatives = engine.evaluateAlternatives()
      // TODO: use engine.getOptions
      const nbMotorisations = 3
      const nbFuels = 4
      const nbSizes = 5
      const nbAlternatives =
        // Thermique + Hybride
        (nbMotorisations - 1) * nbFuels * nbSizes +
        // Electrique
        nbSizes

      expect(alternatives).toHaveLength(nbAlternatives)
      alternatives.forEach((alternative) => {
        expect(alternative.kind).toEqual("car")
        expect(alternative.cost.value).toBeGreaterThan(0)
        expect(alternative.emissions.value).toBeGreaterThan(0)
        expect(alternative.size.value).toBeDefined()
        expect(alternative.size.isEnumValue).toBeTruthy()
        expect(alternative.motorisation.value).toBeDefined()
        expect(alternative.motorisation.isEnumValue).toBeTruthy()
        if (alternative.motorisation.value !== "électrique") {
          expect(alternative.fuel?.value).toBeDefined()
          expect(alternative.fuel?.isEnumValue).toBeTruthy()
        } else {
          expect(alternative.fuel).toBeUndefined()
        }
      })
    })
  })

  describe("evaluateTargetCar()", () => {
    test("should return values corresponding to the defaults ones", () => {
      const engine = globalTestEngine.shallowCopy()
      const targetInfos = engine.evaluateTargetCar()
      const carInfos = engine.evaluateCar()

      expect(targetInfos.size).toEqual(carInfos.size)
      expect(targetInfos.hasChargingStation).toEqual({
        value: true,
        title: "Borne de recharge",
        isApplicable: true,
        isEnumValue: false,
      })
    })

    test("should return values corresponding to the inputs", () => {
      const engine = globalTestEngine.shallowCopy()
      const targetInfos = engine
        .setInputs({
          "voiture . cible . gabarit": "SUV",
          "voiture . cible . borne de recharge": false,
        })
        .evaluateTargetCar()

      expect(targetInfos.size).toEqual({
        value: "SUV",
        title: "SUV",
        isApplicable: true,
        isEnumValue: true,
      })
      expect(targetInfos.hasChargingStation).toEqual({
        value: false,
        title: "Borne de recharge",
        isApplicable: true,
        isEnumValue: false,
      })
    })
  })
})
