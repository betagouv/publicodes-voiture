import { CarSimulator as Old } from "@betagouv/publicodes-voiture"
import { CarSimulator as New } from "../dist/src/index.cjs"
import { bench, run, summary } from "mitata"

let oldSimulator = new Old()
let newSimulator = new New()

summary(() => {
  bench("evaluateCar() (old)", () => {
    oldSimulator = oldSimulator.shallowCopy()
    oldSimulator.evaluateCar()
  })

  bench("evaluateCar() (new)", () => {
    newSimulator = newSimulator.shallowCopy()
    newSimulator.evaluateCar()
  })
})

summary(() => {
  bench("evaluateAlternatives() (old)", () => {
    oldSimulator = oldSimulator.shallowCopy()
    oldSimulator.evaluateAlternatives()
  })

  bench("evaluateAlternatives() (new)", () => {
    newSimulator = newSimulator.shallowCopy()
    newSimulator.evaluateAlternatives()
  })
})

await run({
  format: "mitata",
  throw: true,
})
