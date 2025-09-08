import { CarSimulator, type Situation as S } from "@betagouv/publicodes-voiture"
// import { CarSimulator, type Situation as S } from "../../dist/src"

export const simulator = new CarSimulator()
export type Situation = S
