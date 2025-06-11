<script lang="ts">
import { goto } from "$app/navigation";
import { simulator } from "$lib/simulator";
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Form,
  NumberInput,
  Pagination,
  Toolbar,
  ToolbarContent,
  ToolbarSearch,
} from "carbon-components-svelte";
import { type Situation } from "../../../src";

type Data = {
  id: number;
  title: string;
  km: string;
  duree: string;
  hypotheses: {
    "coût d'achat": string;
    consommation: string;
    "prix carburant": string;
    "prix kWh": string;
  };
};

const pp = (n: number | null | undefined, unit: string, round = true) =>
  n != null
    ? `${
      (round ? Math.round(n) : n)
        .toLocaleString("fr-FR")
    } ${unit}`
    : "N/A";

const engine = simulator.getEngine();

const situationDefaut = {
  // "voiture . prix d'achat . estimé": 30000,
  "voiture . durée de détention totale": 5.5,
  "usage . km annuels . connus": "oui",
  "usage . km annuels . renseignés": 12000,
};

let alternatives: Data[] = $state([]);
let situation: Situation = $state(situationDefaut);
let submitted = $state(true);
let pageSize = $state(15);
let page = $state(1);
let searchValue = $state("");
let loading = $state(true);
let rows = 40;

$effect(() => {
  if (submitted) {
    loading = true;
    alternatives = simulator.setSituation(situation)
      .evaluateAlternatives().filter((alternative) =>
        alternative.motorisation.value !== "électrique"
      )
      .map((alternative, id) => {
        engine.setSituation(
          {
            ...situation as any,
            "voiture . gabarit": `'${alternative.size.value}'`,
            "voiture . motorisation": `'${alternative.motorisation.value}'`,
            "voiture . thermique . carburant": alternative.fuel?.value
              ? `'${alternative.fuel.value}'`
              : undefined,
          },
          { keepPreviousSituation: false },
        );
        return {
          id,
          title: alternative.title!,
          "km": pp(alternative.electricSwitch.distance.value, "km"),
          "duree": pp(alternative.electricSwitch.period.value, "an"),
          "total": pp(alternative.cost.total.value, "€/an"),
          "usage": pp(
            alternative.cost.usage.value,
            "€/an",
          ),
          "conso": pp(
            alternative.cost.consomption.value,
            "€/an",
          ),
          "possession": pp(
            alternative.cost.ownership.value,
            "€/an",
          ),
          "hypotheses": {
            "coût d'achat": pp(
              engine.evaluate("voiture . prix d'achat").nodeValue as number,
              "€",
            ),
            "consommation": pp(
              engine.evaluate(
                "voiture . thermique . consommation estimée",
              ).nodeValue as number,
              "L/100km",
              false,
            ),
            "prix carburant": pp(
              engine.evaluate("voiture . thermique . prix carburant")
                .nodeValue as number,
              "€/L",
              false,
            ),
            "prix kWh": pp(
              engine.evaluate("voiture . électrique . prix kWh")
                .nodeValue as number,
              "€/kWh",
              false,
            ),
          },
        };
      });
    loading = false;
    submitted = false;
  }
});

let filteredRowIds = $derived(
  alternatives
    .filter((row) => {
      return (
        row.title.toLowerCase().includes(searchValue.toLowerCase())
      );
    })
    .map((row) => row.id.toString()),
);
</script>

<div class="flex flex-col gap-8">
  <h1>Calculateur de rentabilité pour le passage à l'électrique</h1>

  <Form
    class="flex flex-col"
    on:submit={(e: Event) => {
      e.preventDefault();
      submitted = true;
      loading = true;
    }}
  >
    <div class="inline-flex gap-8">
      <NumberInput
        id="prix-achat"
        label="Prix d'achat estimé (€)"
        min={1}
        max={100000}
        required={false}
        bind:value={situation["voiture . prix d'achat . estimé"]}
      />

      <NumberInput
        id="durée-détention"
        label="Durée de détention (années)"
        min={1}
        max={100}
        required={false}
        step={0.5}
        bind:value={situation["voiture . durée de détention totale"]}
      />

      <NumberInput
        id="km-annuels"
        label="Kilométrage annuel (km)"
        min={0}
        required={false}
        bind:value={situation["usage . km annuels . renseignés"]}
      />
    </div>

    <Button class="w-24 !mt-4" size="field" type="submit">Calculer</Button>
  </Form>

  {#if alternatives.length === 0 || loading}
    <DataTableSkeleton
      title="Alternatives"
      headers={[
        { key: "title", value: "Alternatives" },
        { key: "total", value: "Coût total" },
        { key: "usage", value: "Coût d'usage" },
        { key: "conso", value: "Coût de consommation" },
        { key: "possession", value: "Coût de possession" },
        { key: "km", value: "Kilométrage annuel" },
        { key: "duree", value: "Durée de détention" },
      ]}
      {rows}
    />
  {:else}
    <DataTable
      title="Alternatives"
      description="Récapitulatif de la durée de détention et du kilométrage annuel nécessaires pour rentabiliser l'achat d'une voiture électrique."
      headers={[
        { key: "title", value: "Alternatives" },
        { key: "total", value: "Coût total" },
        { key: "usage", value: "Coût d'usage" },
        { key: "conso", value: "Coût de consommation" },
        { key: "possession", value: "Coût de possession" },
        { key: "km", value: "Kilométrage annuel" },
        { key: "duree", value: "Durée de détention" },
      ]}
      rows={alternatives}
      {pageSize}
      {page}
      zebra
      sortable
      expandable
    >
      <Toolbar>
        <ToolbarContent>
          <ToolbarSearch
            persistent
            shouldFilterRows
            lang="fr"
            placeholder="Rechercher une alternative"
            bind:filteredRowIds
            bind:value={searchValue}
          />
        </ToolbarContent>

        <Button
          kind="secondary"
          size="default"
          on:click={() => goto("/documentation")}
        >
          Explorer le calcul
        </Button>
      </Toolbar>
      <svelte:fragment slot="expanded-row" let:row>
        <ul class="py-8">
          <li>Coût d'achat : {row.hypotheses["coût d'achat"]}</li>
          <li>Consommation : {row.hypotheses.consommation}</li>
          <li>Prix carburant : {row.hypotheses["prix carburant"]}</li>
          <li>Prix kWh : {row.hypotheses["prix kWh"]}</li>
        </ul>
      </svelte:fragment>
    </DataTable>

    <Pagination
      bind:pageSize
      bind:page
      totalItems={filteredRowIds.length}
      pageSizeInputDisabled
    />
  {/if}
</div>
