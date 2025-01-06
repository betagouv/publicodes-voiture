import Engine from "publicodes"
import rules, { RuleName } from "../publicodes-build"
import { expect, test, describe } from "vitest"

describe("Alternatives", () => {
  const engine = new Engine<RuleName>(rules, {
    logger: {
      log: () => {},
      warn: () => {},
      error: (message: string) => console.error(message),
    },
  })

  describe("Garder sa voiture actuelle", () => {
    test("diminue les coûts annuels", () => {
      const coutsDeBase = engine.evaluate("coûts").nodeValue?.valueOf()
      const acoutsAlternative = engine
        .evaluate("alternatives . garder sa voiture . coûts")
        .nodeValue?.valueOf()

      if (
        typeof coutsDeBase === "number" &&
        typeof acoutsAlternative === "number"
      ) {
        expect(acoutsAlternative).toBeLessThan(coutsDeBase)
      } else {
        expect(false, "les coûts doivent être des nombres").toBeTruthy()
      }
    })

    test("garde la même empreinte", () => {
      const empreinteDeBase = engine.evaluate("empreinte").nodeValue?.valueOf()
      const empreinteAlternative = engine
        .evaluate("alternatives . garder sa voiture . empreinte")
        .nodeValue?.valueOf()

      if (
        typeof empreinteDeBase === "number" &&
        typeof empreinteAlternative === "number"
      ) {
        expect(empreinteAlternative).toEqual(empreinteDeBase)
      } else {
        expect(false, "les empreintes doivent être des nombres").toBeTruthy()
      }
    })

    test("plus la durée de détention est longue, plus les coûts annuels diminuent", () => {
      const coutsAlternative5ans = engine
        .evaluate("alternatives . garder sa voiture . coûts")
        .nodeValue?.valueOf()
      const coutsAlternative7ans = engine
        .setSituation({
          "alternatives . garder sa voiture . durée supplémentaire": 7,
        })
        .evaluate("alternatives . garder sa voiture . coûts")
        .nodeValue?.valueOf()

      if (
        typeof coutsAlternative5ans === "number" &&
        typeof coutsAlternative7ans === "number"
      ) {
        expect(coutsAlternative7ans).toBeLessThan(coutsAlternative5ans)
      } else {
        expect(false, "les coûts doivent être des nombres").toBeTruthy()
      }
    })
  })
})
