<script>
  import { onMount, onDestroy } from "svelte";
  import Widget from "./Widget.svelte";
  export let currentPage; // Start on the first page
  let error = "";
  let widgets = [];

  const widgetsPerPage = 9; // Number of widgets to display per page

  // Function to fetch widgets from local storage
  function loadWidgets() {
    let savedWidgets = localStorage.getItem("widgets");
    if (savedWidgets) {
      widgets = JSON.parse(savedWidgets).map((widget, index) => ({ ...widget, id: index }));
      error = ""; // Clear error if data is loaded successfully
    } else {
      widgets = [];
      error = "No widgets found in local storage.";
    }
  }

  // Get the widgets for the current page
  function getPagedWidgets(currentPage) {
    const startIndex = (currentPage - 1) * widgetsPerPage;
    const endIndex = startIndex + widgetsPerPage;
    return widgets.slice(startIndex, endIndex);
  }

  // Go to the previous page
  function prevPage() {
    if (currentPage > 1) {
      currentPage--;
    }
  }

  // Go to the next page
  function nextPage() {
    if (currentPage < Math.ceil(widgets.length / widgetsPerPage)) {
      currentPage++;
    }
  }

  // Update widgets when localStorage changes (even across tabs)
  function handleStorageChange(event) {
    console.log("Local storage changed:", event);
    if (event.key === "widgets") {
      loadWidgets(); // Reload widgets if localStorage changes
    }
  }

  // Handle local storage changes in the current tab
  function overrideSetItem() {
    const originalSetItem = localStorage.setItem;

    localStorage.setItem = function (key, value) {
      originalSetItem.apply(this, arguments);
      
      // Manually trigger a custom event to handle local changes
      const storageEvent = new Event("local-storage-change");
      window.dispatchEvent(storageEvent);
    };
  }

  // Listen for both the 'storage' event (for other tabs) and the custom event
  function handleLocalStorageChange() {
    
    loadWidgets();
  }

  // When the component is mounted
  onMount(() => {
    // Load widgets initially
    loadWidgets();

    // Listen for local storage changes (cross-tab)
    window.addEventListener("storage", handleStorageChange);

    // Override localStorage.setItem to trigger local updates
    overrideSetItem();

    // Listen for custom local storage change event
    window.addEventListener("local-storage-change", handleLocalStorageChange);
  });

  // Cleanup when the component is destroyed
  onDestroy(() => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("local-storage-change", handleLocalStorageChange);
  });
</script>

<!-- Tailwind Styles -->
<div class="p-6 border border-gray-300 rounded-lg bg-gray-50 max-w-6xl mx-auto h-full flex flex-col">
  {#if error}
    <p class="text-red-500 font-bold">{error}</p>
  {/if}
  {#if widgets.length > 0}
    <div class="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-5 gap-y-4 mt-4 justify-center mx-auto">
      {#each getPagedWidgets(currentPage) as widget, index (widget.id)}
        <Widget goalType={widget.goalType} color={widget.color} inputs={widget.inputs} />
      {/each}
    </div>

    <!-- Pagination Buttons -->
    <div class="flex justify-between mt-4">
      <button class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50" on:click={prevPage} disabled={currentPage === 1}>
        Previous
      </button>

      <span class="text-gray-700">Page {currentPage} of {Math.ceil(widgets.length / widgetsPerPage)}</span>

      <button class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50" on:click={nextPage} disabled={currentPage === Math.ceil(widgets.length / widgetsPerPage)}>
        Next
      </button>
    </div>
  {:else}
    <h1 class="text-gray-500 text-center">No widgets configured.</h1>
  {/if}
</div>
