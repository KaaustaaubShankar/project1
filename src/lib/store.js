// store.js
import { writable } from 'svelte/store';

// Store for widgets
export const widgets = writable([]);

// Store for the current page
export const currentPage = writable(1);

// Function to load widgets from localStorage
export function loadWidgets() {
  let savedWidgets = localStorage.getItem("widgets");
  if (savedWidgets) {
    widgets.set(JSON.parse(savedWidgets).map((widget, index) => ({ ...widget, id: index })));
  } else {
    widgets.set([]); // If no widgets, set an empty array
  }
}

// Function to save widgets to localStorage
export function saveWidgets(newWidgets) {
  localStorage.setItem("widgets", JSON.stringify(newWidgets));
  widgets.set(newWidgets); // Update the store
}
