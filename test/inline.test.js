import Engine from "publicodes"
import { getModelFromSource } from "@publicodes/tools/compilation"
import { expect, test, describe } from "vitest"

const model = getModelFromSource("rules/**/*.publicodes")

const engine = new Engine(model)
const defaultEngine = engine.shallowCopy()

Object.entries(model).forEach(([ruleName, rule]) => {
  if (rule && "test" in rule) {
    describe(ruleName, () => {
      Object.entries(rule.test).forEach(([testName, testInfos]) => {
        test(testName, () => {
          const context = testInfos.contexte || {}
          const expected = defaultEngine.evaluate(testInfos["valeur attendue"])

          engine.setSituation(context)
          const actual = engine.evaluate(ruleName)

          expect(actual.nodeValue).toEqual(expected.nodeValue)
          expect(actual.unit).toEqual(expected.unit)
        })
      })
    })
  }
})
