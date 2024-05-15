<script lang="ts">
  import { chromeStorageLocal } from "svelte-chrome-storage";
  // import { summaryResult } from "../state";
  let summaryResult = chromeStorageLocal("summaryResult");
  $: {
    console.log("GETTING RESULT FROM STORE????", $summaryResult);
  }
</script>

<div>Summarize.svelte</div>
