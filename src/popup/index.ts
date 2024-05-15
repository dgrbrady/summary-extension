import Summarize from '../components/Summarize.svelte';

const target = document.getElementById('summarize_extension_root');

async function render() {
  // const {count} = await chrome.storage.sync.get({count: 0});

  if (!target) {
    throw new Error('#app not found');
  }
  new Summarize({ target, props: {} });
}

document.addEventListener('DOMContentLoaded', render);
