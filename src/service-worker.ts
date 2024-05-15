// import { summaryResult } from "./state";
// chrome.contextMenus.onClicked.addListener((info) => {
//   console.log("clicked", info);
// });
//
// chrome.runtime.onInstalled.addListener(() => {
//   chrome.contextMenus.create({
//     id: "summarize",
//     title: "Summarize",
//     contexts: ["all"],
//   });
// });

import { pipeline, env, SummarizationPipeline, type PipelineType, QuestionAnsweringPipeline } from "@xenova/transformers";
env.allowLocalModels = false;
// Due to a bug in onnxruntime-web, we must disable multithreading for now.
// See https://github.com/microsoft/onnxruntime/issues/14445 for more information.
env.backends.onnx.wasm.numThreads = 1;


class PipelineSingleton {
  static model = "Xenova/distilbart-cnn-6-6";
  static instance: SummarizationPipeline;
  static task: PipelineType = 'summarization';
  static loadedInstances = new Map<PipelineType, any>();

  static async getInstance<T>(progress_callback: Function | undefined = undefined) {
    if (this.loadedInstances.has(this.task)) {
      return this.loadedInstances.get(this.task) as T;
    }

    const instance = await pipeline(this.task, this.model, { progress_callback });
    this.loadedInstances.set(this.task, instance);
    return instance as T;
  }
}

// Create generic summarize function, which will be reused for the different types of events.
const summarize = async (text: string) => {
  // Get the pipeline instance. This will load and build the model when run for the first time.
  let model = await PipelineSingleton.getInstance<SummarizationPipeline>((data: { progress: number, status: 'progress' } | { status: 'done' }) => {
    // You can track the progress of the pipeline creation here.
    // e.g., you can send `data` back to the UI to indicate a progress bar
    console.log('progress', data)

  });

  // Actually run the model on the input text
  let result = await model(text);
  return result;
};

const answerQuestion = async (question: string, text: string) => {

  // Get the pipeline instance. This will load and build the model when run for the first time.
  let model = await PipelineSingleton.getInstance<QuestionAnsweringPipeline>((data: { progress: number, status: 'progress' } | { status: 'done' }) => {
    // You can track the progress of the pipeline creation here.
    // e.g., you can send `data` back to the UI to indicate a progress bar
    console.log('progress', data)
  });

  // Actually run the model on the input text
  let result = await model(question, text);
  return result;
}

// A generic onclick callback function.
chrome.contextMenus.onClicked.addListener(genericOnClick);



// A generic onclick callback function.
async function genericOnClick(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) {
  if (info.selectionText !== undefined && tab?.id !== undefined) {
    chrome.storage.session.set({ selectionText: info.selectionText });
    chrome.sidePanel.open({ tabId: tab.id })
  }
}

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    title: '✨ Summarize This',
    contexts: ['selection'],
    id: 'selection'
  });
});

// Listen for messages from the UI, process it, and send the result back.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('message/sender', message, sender);
  // if (message.action !== 'summarization') return; // Ignore messages that are not meant for summarization.

  // Run model prediction asynchronously
  (async function () {
    PipelineSingleton.model = message.model;
    PipelineSingleton.task = message.action;

    if (message.action === 'summarization') {
      if (!message.text) return;
      console.log('RUNNING SUMMARIZATION MODEL');
      const result = await summarize(message.text);
      sendResponse(result);
    } else {
      console.log('RUNNING QUESTION ANSWER MODEL');
      const result = await answerQuestion(message.question, message.text);
      sendResponse(result);
    }
  })();

  // return true to indicate we will send a response asynchronously
  // see https://stackoverflow.com/a/46628145 for more information
  return true;
});
