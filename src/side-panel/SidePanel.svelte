<script lang="ts">
  import Options from "../options/Options.svelte";
  import { onMount } from "svelte";

  let selectedText = "";
  let questionText = "";
  let summaryResult = "";
  let questionResult = "";
  let loading = false;
  let loadingQuestion = false;
  let showOptions = false;

  $: summarize(selectedText);
  $: textAreaValue = selectedText;

  onMount(() => {
    chrome.storage.session.get("selectionText", (storage) => {
      console.log("SELECTION TEXT", storage.selectionText);
      if (storage.selectionText) {
        selectedText = storage.selectionText;
      }
    });
    chrome.storage.session.onChanged.addListener((changes) => {
      console.log("CHANGES", changes);
      const selectionTextChange = changes.selectionText;
      if (selectionTextChange) {
        selectedText = selectionTextChange.newValue;
      }
    });
  });

  async function summarize(text: string) {
    if (text === "") {
      return;
    }
    const storage = await chrome.storage.sync.get("summaryOptions");
    console.log("SUMMARY OPTIONS", storage);
    loading = true;
    chrome.runtime.sendMessage(
      { action: "summarization", text, model: storage.summaryOptions.model },
      (result) => {
        console.log("RESULT FROM SUMMARIZATION MODEL", result);
        summaryResult = result[0].summary_text;
        loading = false;
      },
    );
  }

  async function askQuestion(question: string) {
    if (question === "") {
      return;
    }
    const storage = await chrome.storage.sync.get("questionOptions");
    loadingQuestion = true;
    chrome.runtime.sendMessage(
      {
        action: "question-answering",
        question,
        text: selectedText,
        model: storage.questionOptions.model,
      },
      (result) => {
        console.log("RESULT FROM QUESTION ANSWERING MODEL", result);
        questionResult = result.answer;
        loadingQuestion = false;
      },
    );
  }
</script>

<button
  class="bg-blue-500 text-white text-base font-bold py-1 px-2 rounded my-4"
>
  <label class="w-full cursor-pointer" for="showOptions">Toggle Options</label>
  <input
    class="hidden"
    id="showOptions"
    type="checkbox"
    bind:checked={showOptions}
  />
</button>

{#if showOptions}
  <Options />
{:else}
  <div class="flex flex-col">
    <label for="selectionText" class="flex-1 font-bold text-lg"
      >Selected Text</label
    >
    <textarea
      class="flex-1 p-1 border border-gray-400 bg-gray-100 rounded"
      rows="10"
      id="selectionText"
      bind:value={textAreaValue}
    ></textarea>
    <button
      class="w-full bg-blue-500 text-white text-base font-bold py-1 px-2 rounded my-4"
      on:click={() => {
        selectedText = "";
        selectedText = textAreaValue;
      }}>Summarize</button
    >
  </div>

  <h3 class="text-2xl font-bold">Results</h3>

  {#if loading}
    <div>
      Processing...
      <div class="progress w-full h-2 bg-blue-500 rounded" />
    </div>
  {:else}
    <p>{summaryResult}</p>
  {/if}

  {#if summaryResult}
    <div class="flex flex-col">
      <label for="question" class="flex-1 font-bold text-lg"
        >Ask a question</label
      >
      <input
        type="text"
        class="flex-1 p-1 border border-gray-400 bg-gray-100 rounded"
        id="question"
        bind:value={questionText}
      />
      <button
        on:click={() => askQuestion(questionText)}
        class="w-full bg-blue-500 text-white text-base font-bold py-1 px-2 rounded my-4"
        >Submit</button
      >
    </div>
    {#if loadingQuestion}
      <div>
        Processing...
        <div class="progress w-full h-2 bg-cyan-500 rounded" />
      </div>
    {:else}
      <div class="font-bold text-lg">Answer</div>
      <p>{questionResult}</p>
    {/if}
  {/if}
{/if}

<style>
  .progress {
    transform-origin: 0% 50%;
    animation: anim-indeterminate 2s infinite linear;
  }
  /* prettier-ignore */
  @keyframes anim-indeterminate {
		0% { transform: translateX(0) scaleX(0); }
		40% { transform: translateX(0) scaleX(0.4); }
		100% { transform: translateX(100%) scaleX(0.5); }
	}
</style>
