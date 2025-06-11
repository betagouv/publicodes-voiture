<script lang="ts">
import { page } from "$app/state";
import { RulePage } from "@publicodes/react-ui";
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import Markdown from "react-markdown";
import { onMount } from "svelte";

import { goto } from "$app/navigation";
import { simulator } from "$lib/simulator";
import { Button } from "carbon-components-svelte";

let docElement: HTMLDivElement;

const Link = ({ to, children }: {
  to: string;
  children: any;
}) => {
  const onButtonClick = (evt: Event) => {
    evt.preventDefault();
    goto(to);
  };

  return createElement("button", { onClick: onButtonClick }, children);
};

const documentationProps = $derived({
  engine: simulator.getEngine(),
  searchBar: false,
  class: "prose",
  documentationPath: "/documentation",
  showDevSection: false,
  searchBar: true,
  rulePath: page.params.rulePath === ""
    ? "rentabilité passage à l'électrique"
    : page.params.rulePath,
  renderers: {
    Link,
    Text: ({ children }: { children: any }) => (
      createElement(Markdown, { children })
    ),
  },
  // other props left as an exercice to the reader
});

let reactRoot: Root | undefined = $state();

$effect(() => {
  if (!reactRoot) return;
  reactRoot.render(createElement(RulePage, documentationProps));
});

try {
  onMount(() => {
    reactRoot = createRoot(docElement);
  });
} catch (e) {
  console.error(e);
}
</script>

<div class="absolute top-0 left-0 right-0 z-10">
  <Button size="small" on:click={() => goto("/")}>
    Retour à l'accueil
  </Button>
</div>

<section class="absolute top-20 left-5 right-10">
  <div class="max-w-7xl" bind:this={docElement}></div>
</section>

<style>
:global(h1, h2, h3, h4, h5, h6) {
  text-align: left !important;
  padding-top: 3rem;
  padding-bottom: 1rem;
}

:global(button) {
  text-decoration: underline;
  padding: 0.5rem 0rem;
  text-align: left !important;
}

:global(button:hover) {
  background-color: "#0f62fe";
  cursor: pointer;
}
</style>
