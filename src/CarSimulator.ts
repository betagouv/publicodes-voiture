import Engine, {
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

/**
 * Evaluated rule values for the car.
 */
export type EvaluatedCarInfos = {
  /** The title of the rule */
  title?: string
  /** The cost of the car in €/an */
  cost: {
    total: EvaluatedRuleInfos<RuleValue["coûts"]>
    ownership: EvaluatedRuleInfos<RuleValue["coûts . coûts de possession"]>
    usage: EvaluatedRuleInfos<RuleValue["coûts . coûts d'utilisation"]>
    consomption: EvaluatedRuleInfos<
      RuleValue["coûts . coûts d'utilisation . consommation"]
    >

    // ownership: {
    //   total: EvaluatedRuleInfos<RuleValue["coûts . coûts de possession"]>
    // purchase_cost: EvaluatedRuleInfos<
    //   RuleValue["coûts . coûts de possession . achat amorti"]
    // >
    // technical_inspection: EvaluatedRuleInfos<
    //   RuleValue["coûts . coûts de possession . contrôle technique"]
    // >
    // maintenance: EvaluatedRuleInfos<
    //   RuleValue["coûts . coûts de possession . entretien"]
    // >
    // insurance: EvaluatedRuleInfos<
    //   RuleValue["coûts . coûts de possession . assurance"]
    // >
    // registration_certificate: EvaluatedRuleInfos<
    //   RuleValue["coûts . coûts de possession . certificat d'immatriculation amorti"]
    // >
    // }
    // usage: {
    //   total: EvaluatedRuleInfos<RuleValue["coûts . coûts d'utilisation"]>
    //   consumption: EvaluatedRuleInfos<
    //     RuleValue["coûts . coûts d'utilisation . consommation"]
    //   >
    //   parking: EvaluatedRuleInfos<
    //     RuleValue["coûts . coûts d'utilisation . stationnement"]
    //   >
    //   motorway_fee: EvaluatedRuleInfos<
    //     RuleValue["coûts . coûts d'utilisation . péage"]
    //   >
    //   contraventions: EvaluatedRuleInfos<
    //     RuleValue["coûts . coûts d'utilisation . contraventions"]
    //   >
    //   driving_licence: EvaluatedRuleInfos<
    //     RuleValue["coûts . coûts d'utilisation . permis de conduire"]
    //   >
    // }
  }
  /** The emissions of the car in kgCO2/an */
  emissions: {
    total: EvaluatedRuleInfos<RuleValue["empreinte"]>
    ownership: EvaluatedRuleInfos<
      RuleValue["ngc . transport . voiture . construction"]
    >
    usage: EvaluatedRuleInfos<RuleValue["ngc . transport . voiture . usage"]>
  }
  /** The car size (gabarit) */
  size: EvaluatedRuleInfos<RuleValue["voiture . gabarit"]>
  /** The type of motorisation of the car */
  motorisation: EvaluatedRuleInfos<RuleValue["voiture . motorisation"]>
  /** The type of fuel of the car */
  fuel?: EvaluatedRuleInfos<RuleValue["voiture . thermique . carburant"]>
  electricSwitch: {
    purchaseCost: EvaluatedRuleInfos<
      RuleValue["rentabilité passage à l'électrique . variables . coût d'achat électrique"]
    >
    /** The minimal duration of ownership to make the switch to electric profitable */
    period: EvaluatedRuleInfos<
      RuleValue["rentabilité passage à l'électrique . durée de détention"]
    >
    /** The minimal distance per year to make the switch to electric profitable */
    distance: EvaluatedRuleInfos<
      RuleValue["rentabilité passage à l'électrique . km annuels"]
    >
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
        usage: this.evaluateRule("coûts . coûts d'utilisation"),
        ownership: this.evaluateRule("coûts . coûts de possession"),
        consomption: this.evaluateRule(
          "coûts . coûts d'utilisation . consommation",
        ),
      },
      emissions: {
        total: this.evaluateRule("empreinte"),
        usage: this.evaluateRule("ngc . transport . voiture . usage"),
        ownership: this.evaluateRule(
          "ngc . transport . voiture . construction",
        ),
      },
      size: this.evaluateRule("voiture . gabarit"),
      motorisation,
      fuel:
        motorisation.value !== "électrique"
          ? this.evaluateRule("voiture . thermique . carburant")
          : undefined,
      electricSwitch: {
        purchaseCost: this.evaluateRule(
          "rentabilité passage à l'électrique . variables . coût d'achat électrique",
        ),
        period: this.evaluateRule(
          "rentabilité passage à l'électrique . durée de détention",
        ),
        distance: this.evaluateRule(
          "rentabilité passage à l'électrique . km annuels",
        ),
      },
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
    delete localSituation["voiture . électrique . consommation électricité"]
    delete localSituation["voiture . thermique . consommation carburant"]
    delete localSituation["voiture . thermique . prix carburant"]

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

          res.push(getAlternative(localEngine, size, motorisation, undefined))
        } else {
          for (const fuel of carFuels) {
            localSituation["voiture . thermique . carburant"] =
              fuel.publicodesValue

            localEngine.setSituation(localSituation)

            res.push(getAlternative(localEngine, size, motorisation, fuel))
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
    // NOTE: we are evaluating the rule instead of using the inputs because the
    // inputs might not be set, so we need to evaluate the rule to get the
    // default value.
    const node = this.engine.evaluate(rule)
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
      title: this.engine.getRule(titleRuleName).title,
      isEnumValue,
      isApplicable: node.nodeValue !== null,
    }
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

function getAlternative(
  engine: Engine,
  size: Possibility,
  motorisation: Possibility,
  fuel?: Possibility,
): Alternative {
  return {
    kind: "car",
    title: `${size.title} ${motorisation.title}${fuel ? ` (${fuel.title})` : ""}`,
    cost: {
      total: {
        title: "Coûts annuels",
        unit: "€/an",
        isEnumValue: false,
        isApplicable: true,
        value: engine.evaluate("coûts").nodeValue,
      },
      ownership: {
        title: "Coûts de possession",
        unit: "€/an",
        isEnumValue: false,
        isApplicable: true,
        value: engine.evaluate("coûts . coûts de possession").nodeValue,
      },
      usage: {
        title: "Coûts d'utilisation",
        unit: "€/an",
        isEnumValue: false,
        isApplicable: true,
        value: engine.evaluate("coûts . coûts d'utilisation").nodeValue,
      },
      consomption: {
        title: "Consommation",
        unit: "€/an",
        isEnumValue: false,
        isApplicable: true,
        value: engine.evaluate("coûts . coûts d'utilisation . consommation")
          .nodeValue,
      },
    },
    emissions: {
      total: {
        title: "Empreinte CO2e",
        unit: "kgCO2e/an",
        isEnumValue: false,
        isApplicable: true,
        value: engine.evaluate("empreinte").nodeValue,
      },
      ownership: {
        title: "Empreinte CO2e de construction",
        unit: "kgCO2e/an",
        isEnumValue: false,
        isApplicable: true,
        value: engine.evaluate("ngc . transport . voiture . construction")
          .nodeValue,
      },
      usage: {
        title: "Empreinte CO2e d'usage",
        unit: "kgCO2e/an",
        isEnumValue: false,
        isApplicable: true,
        value: engine.evaluate("ngc . transport . voiture . usage").nodeValue,
      },
    },
    size: {
      value: size.nodeValue,
      title: size.title,
      isEnumValue: true,
      isApplicable: true,
    },
    motorisation: {
      value: motorisation.nodeValue,
      title: motorisation.title,
      isEnumValue: true,
      isApplicable: true,
    },
    fuel: fuel
      ? {
          value: fuel.nodeValue,
          title: fuel.title,
          isEnumValue: true,
          isApplicable: true,
        }
      : undefined,
    // TODO: should be more clever about this
    electricSwitch: {
      purchaseCost: {
        title: engine.getRule(
          "rentabilité passage à l'électrique . variables . coût d'achat électrique",
        ).title,
        value: engine.evaluate(
          "rentabilité passage à l'électrique . variables . coût d'achat électrique",
        ).nodeValue,
        isEnumValue: false,
        isApplicable: true,
      },
      period: {
        title: engine.getRule(
          "rentabilité passage à l'électrique . durée de détention",
        ).title,
        value: engine.evaluate(
          "rentabilité passage à l'électrique . durée de détention",
        ).nodeValue,
        isEnumValue: false,
        isApplicable: true,
      },
      distance: {
        title: engine.getRule("rentabilité passage à l'électrique . km annuels")
          .title,
        value: engine.evaluate(
          "rentabilité passage à l'électrique . km annuels",
        ).nodeValue,
        isEnumValue: false,
        isApplicable: true,
      },
    },
  } as Alternative
}
