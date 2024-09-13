import { parse } from "yaml"
import { readFileSync } from "fs"

/**
 * Parses the ui.yaml file and checks that all rules referenced in it exist in the model.
 *
 * @param {Record<string, import("publicodes").Rule>} model - The publicodes model.
 *
 * @throws If a category, subcategory or question referenced in ui.yaml does not exist in the model.
 */
export default function getUI(model) {
  const ui = parse(readFileSync("ui.yaml", "utf-8"))
  const questionsInModel = Object.entries(model)
    .filter(([_, rule]) => {
      return rule !== null && "question" in rule
    })
    .map(([name, _]) => name)
  let questionsInUI = []
  let error = false

  // Check that all categories, subcategories are existing rules
  // in the model
  for (const cat in ui.categories) {
    if (!(cat in model)) {
      console.error(`(ui:categories) rule [${cat}] not in model`)
      error = true
    }
    for (const sub of ui.categories[cat].sub) {
      if (!(sub in model)) {
        console.error(`(ui:categories:${cat}) rule [${sub}] not in model`)
        error = true
      }
    }
  }

  // Check that all questions are existing rules in the model
  for (const cat in ui.questions) {
    if (!(cat in model)) {
      console.error(`(ui:questions) rule [${cat}] not in model`)
      error = true
    }
    for (const question of ui.questions[cat]) {
      if (!questionsInModel.includes(question)) {
        console.error(
          `(ui:questions:${cat}) question [${question}] not in model`,
        )
        error = true
      }
      questionsInUI.push(question)
    }
  }

  // Check that all questions in the model are referenced in ui.yaml, if not,
  // log a warning (not an error because it could be needed to filter some
  // questions from imported models).
  if (questionsInUI.length !== questionsInModel.length) {
    const missingQuestions = questionsInModel.filter(
      (question) => !questionsInUI.includes(question),
    )
    console.warn(
      `[WARN] The following questions are missing in ui.yaml:

${missingQuestions.join("\n")}`,
    )
  }

  if (error) {
    console.log()
    process.exit(1)
  }

  return ui
}
