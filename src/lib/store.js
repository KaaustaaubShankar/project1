// store.js
import { writable } from "svelte/store";

// Widgets store, initially fetching from localStorage
export const widgets = writable(JSON.parse(localStorage.getItem("widgets") || "[]"));

// Current page store
export const currentPage = writable(1);
