import { beforeEach, describe, expect, test } from "vitest"
import { CarSimulator } from "../src/CarSimulator"
import personas from "../src/personas"

describe("CarSimulator", () => {
  describe("new CarSimulator()", () => {
    test("should return an instance of AidesVeloEngine with corrects rules parsed", () => {
      console.time("CarSimulator init")
      const engine = new CarSimulator()
      console.timeEnd("CarSimulator init")
      expect(engine).toBeInstanceOf(CarSimulator)

      const parsedRules = engine.getEngine().getParsedRules()
      expect(parsedRules["coûts"]).toBeDefined()
      expect(parsedRules["empreinte"]).toBeDefined()
    })
  })

  let engine = new CarSimulator()

  beforeEach(() => {
    // Reset the engine before each test to ensure a clean state
    engine = engine.shallowCopy().setInputs({}, { overwrite: true })
  })

  describe("shallowCopy()", () => {
    test("should allow a complete reset of the inputs", () => {
      engine.setInputs({ "voiture . gabarit": "moyenne" })
      expect(engine.getInputs()).toEqual({ "voiture . gabarit": "moyenne" })

      const newEngine = engine.shallowCopy()
      expect(newEngine.getInputs()).toEqual({ "voiture . gabarit": "moyenne" })
      newEngine.setInputs({}, { overwrite: true })
      expect(newEngine.getInputs()).toEqual({})

      // The original engine should still have its inputs
      expect(engine.getInputs()).toEqual({ "voiture . gabarit": "moyenne" })
    })
  })

  describe("setInputs()", () => {
    test("should correctly set the engine's situation", () => {
      engine.setInputs({ "voiture . gabarit": "moyenne" })

      const situation = engine.getEngine().getSituation()
      expect(situation["voiture . gabarit"]).toEqual("'moyenne'")
    })

    test("should correctly handle undefined values", () => {
      engine.setInputs({ "voiture . gabarit": undefined })

      const situation = engine.getEngine().getSituation()
      expect(situation["voiture . gabarit"]).toBeUndefined()
    })

    test("shouldn't overwrite by default", () => {
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
      expect(
        engine.evaluateRule("usage . km annuels . calculés").isApplicable,
      ).toBeFalsy()
      expect(
        engine.evaluateRule("voiture . électrique . consommation électricité")
          .isApplicable,
      ).toBeFalsy()
    })

    test("should correctly handle conditionals from the inputs", () => {
      expect(
        engine.evaluateRule("usage . km annuels . calculés").isApplicable,
      ).toBeFalsy()
      engine.setInputs({ "usage . km annuels . connus": false })
      expect(
        engine.evaluateRule("usage . km annuels . calculés").isApplicable,
      ).toBeTruthy()
    })

    test("should correctly handle enum values", () => {
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
            .setSituation(persona.contexte)
            .evaluateCar()

          expect(evaluatedCar.emissions.total.value).toEqual(
            persona["empreinte"],
          )
          expect(evaluatedCar.cost.total.value).toEqual(persona["coûts"])
        })
      })
    })

    test("should have default values", () => {
      const carInfos = engine.evaluateCar()

      expect(carInfos.cost.total.value).toBeCloseTo(6370, 0)
      expect(carInfos.emissions.total.value).toBeCloseTo(3022.8, 0)
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
      const carInfos = engine
        .setInputs({
          "voiture . gabarit": "petite",
          "voiture . motorisation": "hybride",
          "voiture . thermique . carburant": "essence E85",
        })
        .evaluateCar()

      expect(carInfos.cost.total.value).toBeGreaterThan(0)
      expect(carInfos.emissions.total.value).toBeGreaterThan(0)
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
      const carInfos = engine
        .setInputs({
          "voiture . motorisation": "électrique",
        })
        .evaluateCar()

      expect(carInfos.cost.total.value).toBeGreaterThan(0)
      expect(carInfos.emissions.total.value).toBeGreaterThan(0)
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
      engine.setInputs({ "usage . km annuels . renseignés": 1000000 })
      console.time("evaluateAlternatives")
      const alternatives = engine.evaluateAlternatives()
      console.timeEnd("evaluateAlternatives")

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
        expect(alternative.cost.total.value).toBeGreaterThan(0)
        expect(alternative.emissions.total.value).toBeGreaterThan(0)
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

    test("increasing the annual distance should increase the cost and emissions", () => {
      engine.setInputs({ "usage . km annuels . renseignés": 10 })
      const alternatives = engine.evaluateAlternatives()

      engine.setInputs({ "usage . km annuels . renseignés": 10000 })
      const newAlternatives = engine.evaluateAlternatives()

      expect(alternatives).toHaveLength(newAlternatives.length)
      alternatives.forEach((alternative, i) => {
        expect(alternative.cost.total.value).toBeLessThan(
          newAlternatives[i].cost.total.value!,
        )
        expect(alternative.emissions.total.value).toBeLessThan(
          newAlternatives[i].emissions.total.value!,
        )
      })
    })

    test("set km to 0 should return 0 for emissions", () => {
      engine.setInputs({
        "usage . km annuels . renseignés": 0,
        "usage . km annuels . connus": true,
      })
      const alternatives = engine.evaluateAlternatives()

      alternatives.forEach((alternative) => {
        expect(alternative.emissions.total.value).toEqual(0)
      })
    })

    test("modify the consumption shouldn't modify the cost and emissions", () => {
      const alternatives = engine.evaluateAlternatives()

      engine.setInputs({
        "voiture . électrique . consommation électricité": 4,
        "voiture . thermique . consommation carburant": 10,
      })
      const newAlternatives = engine.evaluateAlternatives()

      expect(alternatives).toHaveLength(newAlternatives.length)
      alternatives.forEach((alternative, i) => {
        expect(alternative.cost.total.value).toEqual(
          newAlternatives[i].cost.total.value,
        )
        expect(alternative.emissions.total.value).toEqual(
          newAlternatives[i].emissions.total.value,
        )
      })
    })

    test("modify the fuel price should modify the cost only for electricity", () => {
      const alternatives = engine.evaluateAlternatives()

      engine.setInputs({
        "voiture . thermique . prix carburant": 20,
        "voiture . électrique . prix kWh": 20,
      })
      const newAlternatives = engine.evaluateAlternatives()

      expect(alternatives).toHaveLength(newAlternatives.length)
      alternatives.forEach((alternative, i) => {
        if (alternative.motorisation.value === "thermique") {
          expect(alternative.cost.total.value).toEqual(
            newAlternatives[i].cost.total.value!,
          )
        } else {
          expect(alternative.cost.total.value).toBeLessThan(
            newAlternatives[i].cost.total.value!,
          )
        }
        expect(alternative.emissions.total.value).toEqual(
          newAlternatives[i].emissions.total.value,
        )
      })
    })

    test("modify the car price shouldn't modify the cost", () => {
      const alternatives = engine.evaluateAlternatives()

      engine.setInputs({
        "voiture . prix d'achat": 20000,
      })
      const newAlternatives = engine.evaluateAlternatives()

      expect(alternatives).toHaveLength(newAlternatives.length)
      alternatives.forEach((alternative, i) => {
        expect(alternative.cost.total.value).toEqual(
          newAlternatives[i].cost.total.value,
        )
        expect(alternative.emissions.total.value).toEqual(
          newAlternatives[i].emissions.total.value,
        )
      })
    })
  })

  describe("evaluateTargetCar()", () => {
    test("should return values corresponding to the defaults ones", () => {
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
