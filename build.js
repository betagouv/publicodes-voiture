import { writeFileSync } from "fs"
import { getModelFromSource } from "@publicodes/tools/compilation"
import Engine from "publicodes"
import getUI from "./scripts/compile-ui.js"
import getPersonas from "./scripts/compile-personas.js"
import generateCombinations from "./scripts/generate-empreinte.js"

const srcFiles = "rules/**/*.publicodes"
const modelDestPath = "publicodes-voiture.model.json"
const personasDestPath = "publicodes-voiture.personas.json"
const uiDestPath = "publicodes-voiture.ui.json"

const model = getModelFromSource(srcFiles, { verbose: true })
let engine

try {
  engine = new Engine(model)
  engine.evaluate("empreinte")
  // engine.evaluate("coût")
} catch (e) {
  console.error(`❌ Model compilation failed:\n${e.message}\n`)
  process.exit(-1)
}

const resolvedRules = Object.fromEntries(
  Object.entries(engine.getParsedRules()).map(([dottedName, rule]) => {
    delete rule.rawNode["avec"]
    return [dottedName, rule.rawNode]
  }),
)

generateCombinations(resolvedRules)
console.log(`✅ Combinations generated`)

writeFileSync(modelDestPath, JSON.stringify(resolvedRules, null, 2))
console.log(`✅ ${modelDestPath} generated`)

const personas = getPersonas(model)

writeFileSync(personasDestPath, JSON.stringify(personas))
console.log(`✅ ${personasDestPath} generated`)

const ui = getUI(model)

writeFileSync(uiDestPath, JSON.stringify(ui))
console.log(`✅ ${uiDestPath} generated`)

writeFileSync(
  "index.js",
  `
import rules from "./${modelDestPath}" assert { type: "json" };

import personas from "./${personasDestPath}" assert { type: "json" };

import ui from "./${uiDestPath}" assert { type: "json" };

export { personas, ui };

export default rules;
`,
)
console.log(`✅ index.js generated`)

let indexDTypes = Object.keys(engine.getParsedRules()).reduce(
  (acc, dottedName) => acc + `| "${dottedName}"\n`,
  `
import { Rule } from "publicodes";

export type DottedName = 
`,
)

indexDTypes += `

declare let personas: {
    [key: string]: {
      titre: string;
      description: string;
      situation: Situation;
    }
}

declare let ui: {
  categories: Record<RuleName, {index: number, sub: RuleName[]}>;
  questions: Record<RuleName, RuleName[][]>;
}

export { ui, personas }

declare let rules: Record<DottedName, Rule>

export default rules;
`

writeFileSync("index.d.ts", indexDTypes)
console.log(`✅ index.d.ts generated`)
