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

  describe("aides", () => {
    test("bonus écologique", () => {
      let actual = engine.setSituation({}).evaluate("aides . bonus écologique")

      expect(actual.nodeValue).toBeNull()

      actual = engine
        .setSituation({
          "voiture . motorisation": "'électrique'",
          "voiture . prix d'achat": 40000,
        })
        .evaluate("aides . bonus écologique")

      expect(actual.nodeValue).toEqual(4000)
      expect(serializeUnit(actual.unit)).toEqual("€")
    })
  })

  describe("mapping", () => {
    test("la motorisation 'hybride' devrait être mappée vers 'hybride non rechargeable'", () => {
      engine.setSituation({
        "voiture . motorisation": "'hybride'",
      })
      const hybridEmissions = engine.evaluate("empreinte")

      engine.setSituation({
        "ngc . transport . voiture . motorisation":
          "'hybride non rechargeable'",
      })
      const hnrEmissions = engine.evaluate("empreinte")

      engine.setSituation({
        "ngc . transport . voiture . motorisation": "'hybride rechargeable'",
      })
      const hrEmissions = engine.evaluate("empreinte")

      expect(hybridEmissions.nodeValue).toEqual(hnrEmissions.nodeValue)
      expect(hybridEmissions.nodeValue).not.toEqual(hrEmissions.nodeValue)
    })
  })

  describe("voiture . prix d'achat", () => {
    test("prix par défaut", () => {
      const actual = engine.setSituation({}).evaluate("voiture . prix d'achat")

      expect(actual.nodeValue).toEqual(50713)
      expect(serializeUnit(actual.unit)).toEqual("€")
    })

    test("prix par défaut d'une voiture d'occasion devrait être réduit", () => {
      const actual = engine
        .setSituation({ "voiture . occasion": "oui" })
        .evaluate("voiture . prix d'achat")

      expect(actual.nodeValue).toBeCloseTo(15721, 0)
      expect(serializeUnit(actual.unit)).toEqual("€")
    })
  })

  describe("coûts . achat amorti", () => {
    test("les divisions par zero ne devrait pas être possible", () => {
      const actual = engine
        .setSituation({ "voiture . durée de détention totale": 0 })
        .evaluate("coûts . achat amorti")

      expect(actual.nodeValue).toBeCloseTo(10143, 0)
    })

    test.for([
      [1, 17600],
      [2, 15620],
      [3, 14080],
      [4, 12540],
      [5, 11440],
      [6, 10340],
      [7, 9460],
      [8, 8580],
      [9, 7700],
      [10, 6820],
      [11, 5940],
      [12, 5280],
      [13, 4400],
      [14, 3740],
      [15, 2860],
    ])(
      "prix d'achat neuf pour une voiture d'occasion de %i an",
      ([age, prixAchat]) => {
        const actual = engine
          .setSituation({
            "voiture . prix d'achat": prixAchat,
            "voiture . âge": age,
            "voiture . occasion": "oui",
          })
          .evaluate("coûts . achat amorti . prix d'achat neuf")

        expect(actual.nodeValue).toBeCloseTo(22000)
      },
    )

    test.for([
      [1, 17600],
      [2, 15620],
      [3, 14080],
      [4, 12540],
      [5, 11440],
      [6, 10340],
      [7, 9460],
      [8, 8580],
      [9, 7700],
      [10, 6820],
      [11, 5940],
      [12, 5280],
      [13, 4400],
      [14, 3740],
      [15, 2860],
    ])("valeur de revente au bout de %i an (neuf)", ([durée, expected]) => {
      const actual = engine
        .setSituation({
          "voiture . prix d'achat": 22000,
          "voiture . durée de détention totale": durée,
          "voiture . motorisation": "'thermique'",
          "voiture . thermique . carburant": "'essence E5 ou E10'",
        })
        .evaluate("coûts . achat amorti . valeur de revente")

      expect(actual.nodeValue).toBeCloseTo(expected, 0)
      expect(serializeUnit(actual.unit)).toEqual("€")
    })

    test.for([
      [1, 5940],
      [2, 5280],
      [3, 4400],
      [4, 3740],
      [5, 2860],
    ])("valeur de revente au bout de %i an (occasion)", ([durée, expected]) => {
      const actual = engine
        .setSituation({
          "voiture . prix d'achat": 6820, // prix d'achat d'une voiture d'occasion de 10 ans
          "voiture . âge": 10,
          "voiture . occasion": "oui",
          "voiture . durée de détention totale": durée,
          "voiture . motorisation": "'thermique'",
          "voiture . thermique . carburant": "'essence E5 ou E10'",
        })
        .evaluate("coûts . achat amorti . valeur de revente")

      expect(actual.nodeValue).toBeCloseTo(expected, 0)
      expect(serializeUnit(actual.unit)).toEqual("€")
    })

    test.for([
      [1, 17600],
      [2, 15620],
      [3, 14080],
      [4, 12540],
      [5, 11440],
      [6, 10340],
      [7, 9460],
      [8, 8580],
      [9, 7700],
      [10, 6820],
      [11, 5940],
      [12, 5280],
      [13, 4400],
      [14, 3740],
      [15, 2860],
    ])("coût d'achat total au bout de %i an (neuf)", ([durée, expected]) => {
      const actual = engine
        .setSituation({
          "voiture . prix d'achat": 22000,
          "voiture . durée de détention totale": durée,
          "voiture . motorisation": "'thermique'",
          "voiture . thermique . carburant": "'essence E5 ou E10'",
        })
        .evaluate("coûts . achat amorti . coût d'achat total")

      expect(actual.nodeValue).toBeCloseTo(22000 - expected, 0)
      expect(serializeUnit(actual.unit)).toEqual("€")
    })

    test.for([
      [1, 5940],
      [2, 5280],
      [3, 4400],
      [4, 3740],
      [5, 2860],
    ])(
      "coût d'achat total au bout de %i an (occasion)",
      ([durée, expected]) => {
        const actual = engine
          .setSituation({
            "voiture . prix d'achat . estimé": 22000,
            "voiture . occasion": "oui",
            "voiture . durée de détention totale": durée,
            "voiture . motorisation": "'thermique'",
            "voiture . thermique . carburant": "'essence E5 ou E10'",
          })
          .evaluate("coûts . achat amorti . coût d'achat total")
        expect(actual.nodeValue).toBeCloseTo(6820 - expected, 0)
        expect(serializeUnit(actual.unit)).toEqual("€")
      },
    )
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

    test("l'âge de la voiture devrait influence le coût uniquement si la voiture est d'occasion", () => {
      engine.setSituation({
        "voiture . occasion": "non",
        "voiture . âge": 12,
      })
      const coutsNeuf = engine.evaluate("coûts").nodeValue as number
      const prixAchatAmortiNeuf = engine.evaluate("coûts . achat amorti")
        .nodeValue as number

      engine.setSituation({
        "voiture . occasion": "non",
        "voiture . âge": 1,
      })
      const coutsNeufJeune = engine.evaluate("coûts").nodeValue as number
      const prixAchatAmortiNeufJeune = engine.evaluate("coûts . achat amorti")
        .nodeValue as number

      expect(coutsNeuf).toEqual(coutsNeufJeune)
      expect(prixAchatAmortiNeuf).toEqual(prixAchatAmortiNeufJeune)
    })
  })

  // describe("calcul de rentabilité", () => {})
})

function evaluateCostAndEmissions(engine: Engine<RuleName>) {
  return {
    coûts: engine.evaluate("coûts").nodeValue as number,
    empreinte: engine.evaluate("empreinte").nodeValue as number,
  }
}
