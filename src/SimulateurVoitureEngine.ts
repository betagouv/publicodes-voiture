import Engine, { Situation as PublicodesSituation } from "publicodes"
import rules, { Questions, RuleName, Situation } from "../publicodes-build"

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
export class SimulateurVoitureEngine {
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
    this.engine = empty ? new Engine() : new Engine(rules)
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
   * Create a shallow copy of the engine with the same rules and inputs. This
   * is useful to compute the aids for multiple situations.
   *
   * @returns A new instance of the engine with the same rules and inputs.
   */
  public shallowCopy() {
    const newEngine = new SimulateurVoitureEngine(true)
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
