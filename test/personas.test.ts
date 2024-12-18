import Engine, { Situation } from "publicodes"
import { expect, test, describe } from "vitest"

import rules, { RuleName } from "../publicodes-build"
import personas from "../src/personas"

describe("Personas", () => {
  describe("Raw engine", () => {
    const engine = new Engine<RuleName>(rules, {
      logger: {
        log: () => {},
        warn: () => {},
        error: (message: string) => {
          throw new Error(message)
        },
      },
    })

    Object.values(personas).forEach((persona) => {
      test(persona.titre, () => {
        const localEngine = engine
          .shallowCopy()
          .setSituation(persona.situation as Situation<RuleName>, {
            strict: true,
          })

        expect(localEngine.evaluate("empreinte").nodeValue).toEqual(
          persona["empreinte"],
        )
        expect(localEngine.evaluate("coûts").nodeValue).toEqual(
          persona["coûts"],
        )
      })
    })
  })
})
