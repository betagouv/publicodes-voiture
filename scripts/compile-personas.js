import { parse } from "yaml"
import { readFileSync } from "fs"

/**
 * Parses the personas.yaml file
 */
export default function getPersonas(rules) {
  const personas = parse(readFileSync("personas.yaml", "utf-8"))
  let error = false

  Object.entries(personas).forEach(([personaName, persona]) => {
    if (!persona.titre) {
      console.warn(`[getPersonas] '${personaName}' has no title`)
    }
    if (!persona.description) {
      console.warn(`[getPersonas] '${personaName}' has no description`)
    }
    if (!persona.situation) {
      console.warn(`[getPersonas] '${personaName}' has no situation`)
    } else {
      Object.entries(persona.situation).forEach(([name, value]) => {
        if (!(name in rules)) {
          console.error(
            `[getPersonas] '${personaName}' has an unknown rule '${name}'`,
          )
          error = true
        } else if (
          typeof value === "string" &&
          value !== "oui" &&
          value !== "non"
        ) {
          const valueName = value.slice(1, value.length - 1)
          if (!(`${name} . ${valueName}` in rules)) {
            console.error(
              `[getPersonas] '${personaName}' has an unknown value '${valueName}' for rule '${name}'`,
            )
            error = true
          }
        }
      })
    }
  })

  if (error) {
    console.log()
    process.exit(1)
  }

  return personas
}
