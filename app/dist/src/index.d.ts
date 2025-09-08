import { R as RuleValue, Q as Questions, S as Situation, a as RuleName } from '../index-CtddWtII.js';
export { P as Persona } from '../index-CtddWtII.js';
import Engine from 'publicodes';

/**
 * Evaluated rule values for the car.
 */
type EvaluatedCarInfos = {
    /** The title of the rule */
    title?: string;
    /** The cost of the car in €/an */
    cost: {
        total: EvaluatedRuleInfos<RuleValue["coûts"]>;
        totalPurchaseCost: EvaluatedRuleInfos<RuleValue["coûts . achat amorti . coût d'achat total"]>;
        ownership: EvaluatedRuleInfos<RuleValue["coûts . coûts de possession"]>;
        usage: EvaluatedRuleInfos<RuleValue["coûts . coûts d'utilisation"]>;
        consomption: EvaluatedRuleInfos<RuleValue["coûts . coûts d'utilisation . consommation"]>;
    };
    /** The emissions of the car in kgCO2/an */
    emissions: {
        total: EvaluatedRuleInfos<RuleValue["empreinte"]>;
        ownership: EvaluatedRuleInfos<RuleValue["ngc . transport . voiture . construction"]>;
        usage: EvaluatedRuleInfos<RuleValue["ngc . transport . voiture . usage"]>;
    };
    /** The car size (gabarit) */
    size: EvaluatedRuleInfos<RuleValue["voiture . gabarit"]>;
    /** The type of motorisation of the car */
    motorisation: EvaluatedRuleInfos<RuleValue["voiture . motorisation"]>;
    /** The type of fuel of the car */
    fuel?: EvaluatedRuleInfos<RuleValue["voiture . thermique . carburant"]>;
    electricSwitch: {
        purchaseCost: EvaluatedRuleInfos<RuleValue["rentabilité passage à l'électrique . variables . coût d'achat électrique"]>;
        /** The minimal duration of ownership to make the switch to electric profitable */
        period: EvaluatedRuleInfos<RuleValue["rentabilité passage à l'électrique . durée de détention"]>;
        /** The minimal distance per year to make the switch to electric profitable */
        distance: EvaluatedRuleInfos<RuleValue["rentabilité passage à l'électrique . km annuels"]>;
    };
};
/**
 * Models the car informations wanted by the user.
 */
type TargetInfos = {
    size: EvaluatedRuleInfos<RuleValue["voiture . cible . gabarit"]>;
    hasChargingStation: EvaluatedRuleInfos<RuleValue["voiture . cible . borne de recharge"]>;
};
/**
 * Models an alternative to the current car (i.e. defined by the inputs).
 * This is used to compare the current car with other alternatives.
 *
 * @note For now, the only alternative is a car, but in the future, we might
 * have other alternatives like public transport, bike, etc.
 */
type Alternative = {
    kind: "car";
} & EvaluatedCarInfos;
/**
 * Full information about an evaluated value.
 */
type EvaluatedRuleInfos<T> = {
    /**
     * The node value after evaluation.
     *
     * Can be a number, a string, a boolean, null (« non applicable ») or
     * undefined (« non défini »).
     */
    value: T | null | undefined;
    /** The unit of the value */
    unit?: string;
    /** The title of the corresponding rule (used for enums) */
    title?: string;
    /** The value is applicable in the current situation */
    isApplicable?: boolean;
    /** The value is an enum value (i.e. `une possibilité` mechanism) */
    isEnumValue?: boolean;
};
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
declare class CarSimulator {
    private inputs;
    private engine;
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
    constructor(empty?: boolean);
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
    setInputs(inputs: Questions, options?: {
        overwrite: boolean;
    }): this;
    /**
     * Return a copy of the current inputs.
     */
    getInputs(): Questions;
    /**
     * Return the cost and emissions of _current_ car model for the given inputs.
     *
     * @returns The current user's car cost and emissions.
     *
     * @note This computation is cached according to the inputs.
     *
     * TODO: should we implement a cache layer for the wrapped engine?
     */
    evaluateCar(): EvaluatedCarInfos;
    /**
     * Return all the computed alternatives for the given inputs.
     *
     * @returns The alternatives for the given inputs.
     *
     * @note This method is an expensive operation.
     */
    evaluateAlternatives(): Alternative[];
    /**
     * Return the value of the targeted car (wanted size and possibility to
     * have a charging station).
     */
    evaluateTargetCar(): TargetInfos;
    /**
     * Return the value of a rule.
     *
     * @param rule The name of the rule to get the value infos.
     * @param isEnum If `true`, the rule is expected to be an enum rule and
     * therefore, the title of the rule will correspond to the enum value.
     */
    evaluateRule<T extends keyof RuleValue>(rule: T): EvaluatedRuleInfos<RuleValue[T]>;
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
    setSituation(situation: Situation): this;
    /**
     * Create a shallow copy of the engine with the same rules and inputs. This
     * is useful to compute the aids for multiple situations.
     *
     * @returns A new instance of the engine with the same rules and inputs.
     */
    shallowCopy(): CarSimulator;
    /**
     * Return the reference to the wrapped Publicodes engine.
     *
     * @param shallowCopy If `true` (default), a shallow copy of the engine will
     * be returned. Otherwise, the reference to the engine will be returned. This
     * is useful to get the current state of the engine (rules and inputs)
     * without modifying it.
     */
    getEngine(opts?: {
        shallowCopy: boolean;
    }): Engine<RuleName>;
}

export { type Alternative, CarSimulator, type EvaluatedCarInfos, type EvaluatedRuleInfos, Questions, RuleName, RuleValue, Situation, type TargetInfos };
