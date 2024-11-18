import Engine, {
  EvaluatedNode,
  Situation as PublicodesSituation,
  serializeUnit,
} from "publicodes"
import rules, { Questions, RuleName, Situation } from "../publicodes-build"

export type CarInfos = {
  /**
   * The title of the rule
   *
   * TODO: only used for alternatives, should be two different types?
   */
  title?: string
  // NOTE: should we use the Infos type?
  /** The cost of the car in €/an */
  cost: number
  /** The emissions of the car in kgCO2/an */
  emissions: number
  /** The car size (gabarit) */
  size: ValueInfos<Questions["voiture . gabarit"]>
  /** The type of motorisation of the car */
  motorisation: ValueInfos<Questions["voiture . motorisation"]>
  /** The type of fuel of the car */
  fuel: ValueInfos<Questions["voiture . thermique . carburant"]>
}

/**
 * Full information about an evaluated value.
 */
export type ValueInfos<T> = {
  /**
   * The value of the node after evaluation.
   *
   * Can be a number, a string, a boolean, null (« non applicable ») or
   * undefined (« non défini »).
   */
  nodeValue: T | null | undefined
  /** The unit of the value */
  unit?: string
  /** The title of the corresponding rule (used for enums) */
  title?: string
}

/**
 * A logger that ignores logs and warnings and only prints errors to the
 * console.
 *
 * This is useful to avoid polluting the console with unresolvable warnings
 * (should be handled in the Publicodes level).
 */
const engineLogger = {
  log: () => {},
  warn: () => {},
  error: (message: string) => console.error(message),
}

/**
 * A wrapper around the {@link Engine} class to compute the available aids for the
 * given inputs (which are a subset of the Publicodes situation corresponding to
 * the rules that are questions).
 *
 * @note This class is stateful and should be used to compute the aids for a
 * single situation. If you want to compute the aids for multiple situations,
 * you should create a new instance of this class for each situation. You
 * can use {@link shallowCopy} to create a new instance with the same rules and
 * inputs.
 */
export class CarSimulatorEngine {
  private inputs: Questions = {}
  private engine: Engine<RuleName>

  /**
   * Instantiates a new engine with the rules of the car model (or an empty engine if
   * true is passed as argument).
   *
   * @param empty - If `true`, the engine will be instantiated with an empty
   * set of rules. Otherwise, the engine will be instantiated with the rules of
   * the car model.
   *
   * @note This is a expensive operation and should be probably done once and
   * use {@link shallowCopy} to create a new instance with the same rules
   * avoiding the need to reparse the rules.
   */
  constructor(empty = false) {
    this.engine = empty
      ? new Engine(undefined, { logger: engineLogger })
      : new Engine(rules, { logger: engineLogger })
  }

  /**
   * Set the inputs of the engine. This will update the Publicodes situation
   * with the given inputs.
   *
   * @param inputs The inputs to set (corresponding to the rules that are
   * questions).
   *
   * @note The format of the inputs are in the JS format, not the Publicodes
   * format. For example, boolean values are represented as `true` or `false`
   * instead of `oui` or `non` and the values are not wrapped in single quotes.
   */
  public setInputs(inputs: Questions): this {
    this.inputs = inputs
    this.engine.setSituation(
      getSituation(inputs) as PublicodesSituation<RuleName>,
    )
    return this
  }

  /**
   * Return the cost and emissions of _current_ car model for the given inputs.
   *
   * @returns The current user's car cost and emissions.
   */
  public evaluateCar(): CarInfos {
    const emissions = this.evaluateRule("empreinte . voiture")
    const cost = this.evaluateRule("coûts . voiture")

    return {
      cost: cost.nodeValue as number,
      emissions: emissions.nodeValue as number,
      size: this.getValueInfos("voiture . gabarit"),
      motorisation: this.getValueInfos("voiture . motorisation"),
      fuel: this.getValueInfos("voiture . thermique . carburant"),
    }
  }

  /**
   * Return the value infos of a rule.
   *
   * @param rule The name of the rule to get the value infos.
   * @param isEnum If `true`, the rule is expected to be an enum rule and
   * therefore, the title of the rule will correspond to the enum value.
   *
   * NOTE: we probably want to find a way to have T extending RuleName to be
   * able to use this methode with for any rule.
   */
  private getValueInfos<T extends keyof Questions>(
    rule: T,
  ): ValueInfos<Questions[T]> {
    // NOTE: we are evaluating the rule instead of using the inputs because the
    // inputs might not be set, so we need to evaluate the rule to get the
    // default value.
    const node = this.engine.evaluate(rule)
    // NOTE: may not be very stable, if this method is exposed to the public,
    // we should probably find a better way to determine if the rule is an enum
    // (at the Publicodes level probably).
    const isEnum = typeof node.nodeValue === "string"
    const titleRuleName = isEnum
      ? ((rule + " . " + node.nodeValue) as RuleName)
      : rule

    return {
      nodeValue: node.nodeValue as Questions[T],
      unit: serializeUnit(node.unit),
      title: this.engine.getRule(titleRuleName).title,
    }
  }

  /**
   * Evaluate a rule and return the evaluated node {@link EvaluatedNode}.
   *
   * @param rule The name of the rule to evaluate.
   * @returns The evaluated node.
   *
   * @note The only purpose of this methode is to be able to type check the
   * input rule name to ensure that it is a valid rule name. However, this
   * should be refactored in the Publicodes engine at some point.
   */
  public evaluateRule(rule: RuleName): EvaluatedNode {
    return this.engine.evaluate(rule)
  }

  /**
   * Create a shallow copy of the engine with the same rules and inputs. This
   * is useful to compute the aids for multiple situations.
   *
   * @returns A new instance of the engine with the same rules and inputs.
   */
  public shallowCopy() {
    const newEngine = new CarSimulatorEngine(true)
    newEngine.inputs = { ...this.inputs }
    newEngine.engine = this.engine.shallowCopy()
    return newEngine
  }

  /**
   * Return a shallow copy of the wrapped Publicodes engine. This is useful to
   * get the current state of the engine (rules and inputs) without modifying
   * it.
   */
  public getEngine(): Engine<RuleName> {
    return this.engine.shallowCopy()
  }
}

function getSituation(inputs: Questions): Situation {
  return Object.fromEntries(
    Object.entries(inputs)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => {
        switch (typeof value) {
          case "boolean":
            return [key, value ? "oui" : "non"]
          case "string":
            return [key, `'${value}'`]
          default:
            return [key, value]
        }
      }),
  )
}
