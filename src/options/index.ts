import '../app.css';
import Options from './Options.svelte';

const target = document.getElementById('summary_options_root');

async function render() {
  if (!target) {
    throw new Error('Options root element not found');
  }
  new Options({ target, props: {} });
}

document.addEventListener('DOMContentLoaded', render);
