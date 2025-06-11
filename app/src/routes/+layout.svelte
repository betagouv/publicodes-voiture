<script lang="ts">
import "../app.css";
import "carbon-components-svelte/css/white.css";

let { children } = $props();
</script>

<main class="container mx-auto max-w-6xl my-16">
  {@render children()}
</main>
