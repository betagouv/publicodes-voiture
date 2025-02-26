import { writeFileSync } from "fs"
import { join } from "path"
// import { stringify } from "yaml"
import { getModelFromSource } from "@publicodes/tools/compilation"
import Engine from "publicodes"

import getPersonas from "./compile-personas.js"
// import generateAlternatives from "./generate-alternatives.js"

const ROOT_PATH = new URL(".", import.meta.url).pathname
const SRC_FILES = join(ROOT_PATH, "../src/rules/")
// const ALTERNATIVES_DEST_PATH = join(
//   ROOT_PATH,
//   "../src/rules/alternatives.publicodes",
// )
const PERSONAS_DEST_PATH = join(ROOT_PATH, "../src/personas/personas.json")

const model = getModelFromSource(SRC_FILES)
const engine = check(model, "base")

const resolvedRules = Object.fromEntries(
  Object.entries(engine.getParsedRules()).map(([dottedName, rule]) => {
    delete rule.rawNode["avec"]
    return [dottedName, rule.rawNode]
  }),
)

// const alternatives = generateAlternatives(resolvedRules)
// console.log(`✅ './src/rules/alternatives.publicodes' generated`)
// writeFileSync(
//   ALTERNATIVES_DEST_PATH,
//   `# GENERATED FILE - DO NOT EDIT\n\n${stringify(alternatives, {
//     aliasDuplicateObjects: false,
//   })}`,
// )

const personas = getPersonas(resolvedRules)
writeFileSync(PERSONAS_DEST_PATH, JSON.stringify(personas))
console.log(`✅ './src/personas/personas.json' generated`)

function check(rules, step) {
  try {
    const engine = new Engine(rules, { logger: { warn: () => {} } })
    engine.evaluate("empreinte")
    engine.evaluate("coûts")

    return engine
  } catch (e) {
    console.error(`❌ Error at (${step}):\n${e.message}\n`)
    process.exit(-1)
  }
}
