import '../app.css';
import SidePanel from './SidePanel.svelte';

const target = document.getElementById('summary_side_panel_root');

async function render() {
  if (!target) {
    throw new Error('SidePanel root element not found');
  }
  new SidePanel({ target, props: {} });
}

document.addEventListener('DOMContentLoaded', render);
