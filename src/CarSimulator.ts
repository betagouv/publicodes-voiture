import Engine, {
  Evaluation,
  Possibility,
  Situation as PublicodesSituation,
  serializeUnit,
} from "publicodes"
import rules, {
  Questions,
  RuleName,
  RuleValue,
  Situation,
} from "../publicodes-build"

const DUREE_DETENTION_ALTERNATIVE = 10 // an
const AGE_ALTERNATIVE_OCCASION = 5 // an

const PARAMETERS: (keyof Questions)[] = Object.entries(rules)
  .filter(([, rule]) => typeof rule === "object" && rule && rule.question)
  .map(([key]) => key as keyof Questions)

export type RuleValueParams<K extends keyof Questions = keyof Questions> =
  RuleValue[K]

/**
 * Evaluated rule values for the car.
 */
export type EvaluatedCarInfos = {
  /** The title of the rule */
  title?: string
  /** If the car is second-hand */
  occasion: EvaluatedRuleInfos<RuleValue["voiture . occasion"]>
  /** The car size (gabarit) */
  size: EvaluatedRuleInfos<RuleValue["voiture . gabarit"]>
  /** The type of motorisation of the car */
  motorisation: EvaluatedRuleInfos<RuleValue["voiture . motorisation"]>
  /** The type of fuel of the car */
  fuel?: EvaluatedRuleInfos<RuleValue["voiture . thermique . carburant"]>
  /** The inputs used to evaluate the car */
  parameters: EvaluatedRuleInfos<RuleValueParams>[]
  /** The cost of the car in €/an */
  cost: {
    total: EvaluatedRuleInfos<RuleValue["coûts"]>
    purchase: EvaluatedRuleInfos<RuleValue["voiture . prix d'achat"]>
  }
  /** The emissions of the car in kgCO2/an */
  emissions: {
    total: EvaluatedRuleInfos<RuleValue["empreinte"]>
  }
}

/**
 * Models the car informations wanted by the user.
 */
export type TargetInfos = {
  size: EvaluatedRuleInfos<RuleValue["voiture . cible . gabarit"]>
  hasChargingStation: EvaluatedRuleInfos<
    RuleValue["voiture . cible . borne de recharge"]
  >
}

/**
 * Models an alternative to the current car (i.e. defined by the inputs).
 * This is used to compare the current car with other alternatives.
 *
 * @note For now, the only alternative is a car, but in the future, we might
 * have other alternatives like public transport, bike, etc.
 */
export type Alternative = {
  kind: "car"
  /** The cost difference between the alternative and the current car */
  diff_costs: number
  /** The emissions difference between the alternative and the current car */
  diff_emissions: number
  /** Information about the profitability of the alternative over the current car */
  profitability: {
    /** The cost of purchase of the alternative car minus the resale value of the current car and the ecological bonus */
    costOfPurchase: EvaluatedRuleInfos<number | undefined>
    /** The number of years to reach the break-even point */
    duration: EvaluatedRuleInfos<number | undefined>
    /** Savings in € when switching to the alternative during the whole ownership period */
    totalSavings: EvaluatedRuleInfos<number | undefined>
    /** Savings in €/an when switching to the alternative */
    savingsByYear: EvaluatedRuleInfos<number | undefined>
    /** The amount of aids (ecological bonus) for the alternative car */
    aids: EvaluatedRuleInfos<number | undefined>
    /** The resale value of the current car */
    currentCarResaleValue: EvaluatedRuleInfos<number | undefined>
  }
} & EvaluatedCarInfos

/**
 * Full information about an evaluated value.
 */
export type EvaluatedRuleInfos<T> = {
  /**
   * The node value after evaluation.
   *
   * Can be a number, a string, a boolean, null (« non applicable ») or
   * undefined (« non défini »).
   */
  value: T | null | undefined
  /** The unit of the value */
  unit?: string
  /** The title of the corresponding rule (used for enums) */
  title?: string
  /** The value is applicable in the current situation */
  isApplicable?: boolean
  /** The value is an enum value (i.e. `une possibilité` mechanism) */
  isEnumValue?: boolean
  /** The name of the rule, used to identify the rule in the Publicodes engine */
  ruleName?: RuleName
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
export class CarSimulator {
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
   * Update the inputs of the engine. This will update the Publicodes
   * situation with the given inputs.
   *
   * @param inputs The inputs to set (corresponding to the rules that are
   * questions).
   * @param overwrite To overwrite existing inputs (if `true`) or update
   * existing inputs with the one (if `false`).
   *
   * @note The format of the inputs are in the JS format, not the Publicodes
   * format. For example, boolean values are represented as `true` or `false`
   * instead of `oui` or `non` and the values are not wrapped in single quotes.
   * If you prefer to have more control over the situation, you can use {@link
   * setSituation} instead.
   */
  public setInputs(inputs: Questions, options = { overwrite: false }): this {
    if (options.overwrite) {
      this.inputs = inputs
    } else {
      this.inputs = Object.assign(this.inputs, inputs)
    }
    this.engine.setSituation(getSituation(this.inputs))
    return this
  }

  /**
   * Return a copy of the current inputs.
   */
  public getInputs(): Questions {
    return Object.assign({}, this.inputs)
  }

  /**
   * Return the cost and emissions of _current_ car model for the given inputs.
   *
   * @returns The current user's car cost and emissions.
   *
   * @note This computation is cached according to the inputs.
   *
   * TODO: should we implement a cache layer for the wrapped engine?
   */
  public evaluateCar(): EvaluatedCarInfos {
    const motorisation = this.evaluateRule("voiture . motorisation")

    return {
      cost: {
        total: this.evaluateRule("coûts"),
        purchase: this.evaluateRule("voiture . prix d'achat"),
      },
      emissions: {
        total: this.evaluateRule("empreinte"),
      },
      parameters: PARAMETERS.map((key) => this.evaluateRule(key)).filter(
        (rule) => rule.isApplicable,
      ),
      size: this.evaluateRule("voiture . gabarit"),
      occasion: this.evaluateRule("voiture . occasion"),
      motorisation,
      fuel:
        motorisation.value !== "électrique"
          ? this.evaluateRule("voiture . thermique . carburant")
          : undefined,
    }
  }

  /**
   * Return all the computed alternatives for the given inputs.
   *
   * @returns The alternatives for the given inputs.
   *
   * @note This method is an expensive operation.
   */
  public evaluateAlternatives(): Alternative[] {
    const localEngine = this.getEngine().shallowCopy()
    const localSituation = localEngine.getSituation()
    const carSizes = this.getEngine().getPossibilitiesFor("voiture . gabarit")!
    const carMotorisations = this.getEngine().getPossibilitiesFor(
      "voiture . motorisation",
    )!
    const carFuels = this.getEngine().getPossibilitiesFor(
      "voiture . thermique . carburant",
    )!

    const res = []

    // NOTE: we want to use default values for the alternatives as they are
    // specific for each alternative.
    delete localSituation["voiture . prix d'achat"]
    delete localSituation["voiture . durée de détention totale"]
    delete localSituation["voiture . électrique . consommation électricité"]
    delete localSituation["voiture . thermique . consommation carburant"]
    delete localSituation["voiture . thermique . prix carburant"]

    localSituation["voiture . âge"] = AGE_ALTERNATIVE_OCCASION
    localSituation["voiture . durée de détention totale"] =
      DUREE_DETENTION_ALTERNATIVE

    for (const occasion of ["oui", "non"]) {
      localSituation["voiture . occasion"] =
        occasion as Situation["voiture . occasion"]
      for (const size of carSizes) {
        localSituation["voiture . gabarit"] =
          size.publicodesValue as Situation["voiture . gabarit"]
        for (const motorisation of carMotorisations) {
          localSituation["voiture . motorisation"] =
            motorisation.publicodesValue as Situation["voiture . motorisation"]
          if (motorisation.nodeValue === "électrique") {
            localEngine.setSituation(
              localSituation as PublicodesSituation<RuleName>,
            )

            res.push(
              this.getAlternative(
                localEngine,
                occasion === "oui",
                size,
                motorisation,
                undefined,
              ),
            )
          } else {
            for (const fuel of carFuels) {
              localSituation["voiture . thermique . carburant"] =
                fuel.publicodesValue

              localEngine.setSituation(localSituation)

              res.push(
                this.getAlternative(
                  localEngine,
                  occasion === "oui",
                  size,
                  motorisation,
                  fuel,
                ),
              )
            }
          }
        }
      }
    }

    return res
  }

  /**
   * Return the value of the targeted car (wanted size and possibility to
   * have a charging station).
   */
  public evaluateTargetCar(): TargetInfos {
    return {
      size: this.evaluateRule("voiture . cible . gabarit"),
      hasChargingStation: this.evaluateRule(
        "voiture . cible . borne de recharge",
      ),
    }
  }

  /**
   * Return the value of a rule.
   *
   * @param rule The name of the rule to get the value infos.
   * @param isEnum If `true`, the rule is expected to be an enum rule and
   * therefore, the title of the rule will correspond to the enum value.
   */
  public evaluateRule<T extends keyof RuleValue>(
    rule: T,
  ): EvaluatedRuleInfos<RuleValue[T]> {
    return typedEvaluate<T>(this.engine, rule)
  }

  /**
   * Set the situation of the engine. This will update the Publicodes situation
   * with the given situation.
   *
   * @param situation The situation to set.
   * @returns The instance of the engine with the updated situation.
   *
   * @note This is a low-level method prefer using {@link setInputs} instead.
   *
   * @note This will not update the current inputs of the engine. If you want
   * to update the inputs as well, you should use {@link setInputs} instead.
   * It's recommended to not mix the usage of {@link setInputs} and {@link
   * setSituation} to avoid confusion.
   */
  public setSituation(situation: Situation): this {
    this.engine.setSituation(situation as PublicodesSituation<RuleName>)
    return this
  }

  /**
   * Create a shallow copy of the engine with the same rules and inputs. This
   * is useful to compute the aids for multiple situations.
   *
   * @returns A new instance of the engine with the same rules and inputs.
   */
  public shallowCopy() {
    const newEngine = new CarSimulator(true)
    newEngine.inputs = Object.assign({}, this.inputs)
    newEngine.engine = this.engine.shallowCopy()
    return newEngine
  }

  /**
   * Return the reference to the wrapped Publicodes engine.
   *
   * @param shallowCopy If `true` (default), a shallow copy of the engine will
   * be returned. Otherwise, the reference to the engine will be returned. This
   * is useful to get the current state of the engine (rules and inputs)
   * without modifying it.
   */
  public getEngine(opts = { shallowCopy: true }): Engine<RuleName> {
    return opts.shallowCopy ? this.engine.shallowCopy() : this.engine
  }

  private getAlternative(
    alternativeEngine: Engine,
    occasion: boolean,
    size: Possibility,
    motorisation: Possibility,
    fuel?: Possibility,
  ): Alternative {
    const { profitability } = this.computeProfitability(alternativeEngine) ?? {}
    const current_emissions = this.evaluateRule("empreinte").value!
    const emissions = alternativeEngine.evaluate("empreinte")
      .nodeValue as number

    return {
      kind: "car",
      title: `${size.title} ${motorisation.title}${fuel ? ` (${fuel.title})` : ""}`,
      size: enumValue(size),
      motorisation: enumValue(motorisation),
      fuel: enumValue(fuel),
      occasion: booleanValue("Occasion", occasion),
      diff_costs: profitability?.savingsByYear.value!,
      diff_emissions: current_emissions - emissions,
      cost: {
        total: numberValue(
          "Coûts annuels",
          alternativeEngine.evaluate("coûts").nodeValue,
          "€/an",
        ),
        purchase: numberValue(
          "Prix d'achat",
          alternativeEngine.evaluate("voiture . prix d'achat").nodeValue,
          "€",
        ),
      },
      emissions: {
        total: numberValue("Empreinte CO2e", emissions, "kgCO2e/an"),
      },
      profitability,
    } as Alternative
  }

  /**
   * Compute the profitability of the alternative car compared to the current
   * car.
   *
   * NOTE: This should be done directly in the Publicodes rules, but we need to
   * wait for the Publicodes V2 to be able to do that without having severe
   * performance issues.
   */
  private computeProfitability(
    alternativeEngine: Engine,
  ): Pick<Alternative, "profitability"> | undefined {
    const couts_actuels = this.evaluateRule("coûts").value!
    const couts_alternative = typedEvaluate(alternativeEngine, "coûts").value!
    const economie_annuelle = couts_actuels - couts_alternative
    const prix_achat_alternative = typedEvaluate(
      alternativeEngine,
      "voiture . prix d'achat",
    ).value!
    const valeur_revente_actuelle = this.evaluateRule(
      "coûts . achat amorti . valeur de revente",
    ).value!
    const bonus_ecologique = typedEvaluate(
      alternativeEngine,
      "aides . bonus écologique",
    ).value!
    const cout_achat_a_rentabiliser =
      prix_achat_alternative - valeur_revente_actuelle - bonus_ecologique

    const duree_seuil_rentabilite =
      economie_annuelle > 0
        ? Math.max(0, cout_achat_a_rentabiliser / economie_annuelle)
        : null

    return {
      profitability: {
        costOfPurchase: numberValue(
          "Coût d'achat net (après bonus écologique et valeur de revente de la voiture actuelle)",
          cout_achat_a_rentabiliser,
          "€",
        ),
        aids: numberValue("Aides (bonus écologique)", bonus_ecologique, "€"),
        duration: numberValue(
          "Durée pour atteindre le seuil de rentabilité",
          duree_seuil_rentabilite,
          "an",
        ),
        savingsByYear: numberValue(
          "Économies annuelles",
          economie_annuelle,
          "€/an",
        ),
        totalSavings: numberValue(
          "Économies totales",
          economie_annuelle * DUREE_DETENTION_ALTERNATIVE,
          "€",
        ),
        currentCarResaleValue: numberValue(
          "Valeur de revente de la voiture actuelle",
          valeur_revente_actuelle,
          "€",
        ),
      },
    }
  }
}

function typedEvaluate<T extends keyof RuleValue>(
  engine: Engine,
  rule: T,
): EvaluatedRuleInfos<RuleValue[T]> {
  // NOTE: we are evaluating the rule instead of using the inputs because the
  // inputs might not be set, so we need to evaluate the rule to get the
  // default value.
  const node = engine.evaluate(rule)
  // NOTE: may not be very stable, if this method is exposed to the public,
  // we should probably find a better way to determine if the rule is an enum
  // (at the Publicodes level probably).
  const isEnumValue = typeof node.nodeValue === "string"
  const titleRuleName = isEnumValue
    ? ((rule + " . " + node.nodeValue) as RuleName)
    : rule

  return {
    value: node.nodeValue as RuleValue[T],
    unit: serializeUnit(node.unit),
    title: engine.getRule(titleRuleName).title,
    isEnumValue,
    isApplicable: node.nodeValue !== null,
    ruleName: rule,
  }
}

function getSituation(inputs: Questions): PublicodesSituation<RuleName> {
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

function numberValue(
  title: string,
  value: Evaluation,
  unit: string,
): EvaluatedRuleInfos<number | undefined> {
  if (value !== undefined && value !== null && typeof value !== "number") {
    // NOTE: should not happen
    throw new Error("Expected a number, but got: " + value)
  }

  return {
    title,
    unit,
    isEnumValue: false,
    isApplicable: value !== null,
    value,
  }
}

function booleanValue(
  title: string,
  value: Evaluation,
): EvaluatedRuleInfos<boolean | undefined> {
  if (value !== undefined && value !== null && typeof value !== "boolean") {
    // NOTE: should not happen
    throw new Error("Expected a boolean, but got: " + value)
  }

  return {
    title,
    unit: undefined,
    isEnumValue: false,
    isApplicable: value !== null,
    value,
  }
}

const enumValue = (value: Possibility | undefined) =>
  value === undefined
    ? undefined
    : {
        title: value.title,
        value: value.nodeValue,
        isEnumValue: true,
        isApplicable: true,
      }
