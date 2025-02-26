/**
 * Exports the personas object.
 *
 * It's defined in the `personas.yaml` file and allows to define named
 * situations that can be feed into the engine.
 */

import { Situation } from "../../publicodes-build"
import _rawPersonas from "./personas.json"

export type Persona = {
  titre: string
  description?: string
  contexte: Situation
  empreinte: number
  coûts: number
}

/**
 * A set of named situations that can be feed into the engine and used for
 * testing purposes or to provide examples.
 */
export default _rawPersonas as Record<string, Persona>
