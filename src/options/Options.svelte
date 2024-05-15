<script lang="ts">
  import { onMount } from "svelte";
  type SummaryModelOptions = {
    maxNewTokens?: number;
  };

  const defaultSummaryOptions: {
    model: string;
    modelOptions: SummaryModelOptions;
  } = {
    model: "Xenova/distilbart-cnn-6-6",
    modelOptions: {},
  };
  let summaryOptions: { model: string; modelOptions: SummaryModelOptions } = {
    ...defaultSummaryOptions,
  };

  const defaultQuestionOptions: { model: string } = {
    model: "Xenova/distilbert-base-uncased-distilled-squad",
  };
  let questionOptions: { model: string } = { ...defaultQuestionOptions };

  let message: string;

  onMount(() => {
    chrome.storage.sync.get("summaryOptions", (data) => {
      summaryOptions = {
        model: data.summaryOptions.model || defaultSummaryOptions.model,
        modelOptions:
          data.summaryOptions.modelOptions ||
          defaultSummaryOptions.modelOptions,
      };
    });
    chrome.storage.sync.get("questionOptions", (data) => {
      questionOptions = {
        model: data.questionOptions.model || defaultQuestionOptions.model,
      };
    });
  });

  const handleSave = () => {
    chrome.storage.sync.set({ summaryOptions, questionOptions }).then(() => {
      message = "Updated!";
      setTimeout(() => {
        message = "";
      }, 2000);
    });
  };

  const handleSummaryReset = () => {
    summaryOptions = { ...defaultSummaryOptions };
    chrome.storage.sync.set({ summaryOptions }).then(() => {
      message = "Options reset!";
      setTimeout(() => {
        message = "";
      }, 2000);
    });
  };

  const handleQuestionReset = () => {
    questionOptions = { ...defaultQuestionOptions };
    chrome.storage.sync.set({ questionOptions }).then(() => {
      message = "Options reset!";
      setTimeout(() => {
        message = "";
      }, 2000);
    });
  };
</script>

<div class="flex flex-col py-[3%] px-[2%] bg-blue-50 h-screen max-w-lg">
  <h2 class="mb-5">Options Page</h2>

  {#if message}
    <span class="font-bold text-blue-800">{message}</span>
  {/if}

  <form on:submit|preventDefault={handleSave} class="flex flex-col gap-4">
    <h3 class="text-2xl font-bold">Summary Options</h3>
    <button
      class="w-full bg-red-500 text-white text-base font-bold py-2 px-4 rounded mb-4"
      on:click|preventDefault={handleSummaryReset}>Reset Options</button
    >
    <div class="flex items-center gap-2 w-full">
      <label for="summary_model" class="text-lg font-bold text-gray-700">
        Model
      </label>
      <input
        type="text"
        id="summary_model"
        name="summary_model"
        class="border border-gray-300 rounded-md p-2 flex-1"
        bind:value={summaryOptions.model}
      />
      <a
        href="https://huggingface.co/models?pipeline_tag=summarization&library=transformers.js"
        target="_blank">Available models</a
      >
    </div>

    <h3 class="text-2xl font-bold">Question Options</h3>
    <button
      class="w-full bg-red-500 text-white text-base font-bold py-2 px-4 rounded mb-4"
      on:click|preventDefault={handleQuestionReset}>Reset Options</button
    >
    <div class="flex items-center gap-2 w-full">
      <label for="questions_model" class="text-lg font-bold text-gray-700">
        Model
      </label>
      <input
        type="text"
        id="questions_model"
        name="questions_model"
        class="border border-gray-300 rounded-md p-2 flex-1"
        bind:value={questionOptions.model}
      />
      <a
        href="https://huggingface.co/models?pipeline_tag=question-answering&library=transformers.js"
        target="_blank">Available models</a
      >
    </div>
    <button
      class="w-full bg-blue-500 text-white text-base font-bold py-2 px-4 rounded"
      type="submit"
    >
      Save
    </button>
  </form>
</div>
