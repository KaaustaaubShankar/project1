<script>
  import { onMount, onDestroy } from "svelte";
  import Widget from "./Widget.svelte";
  import { widgets, currentPage, loadWidgets } from "./store"; // Import the store

  const widgetsPerPage = 9; // Number of widgets to display per page

  // Get the widgets for the current page
  function getPagedWidgets(currentPageValue, widgetsValue) {
    const startIndex = (currentPageValue - 1) * widgetsPerPage;
    const endIndex = startIndex + widgetsPerPage;
    return widgetsValue.slice(startIndex, endIndex);
  }

  // Go to the previous page
  function prevPage() {
    currentPage.update(n => n > 1 ? n - 1 : n);
  }

  // Go to the next page
  function nextPage() {
    widgets.subscribe(widgetsValue => {
      currentPage.update(n => n < Math.ceil(widgetsValue.length / widgetsPerPage) ? n + 1 : n);
    });
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

  // When the component is mounted
  onMount(() => {
    loadWidgets();
    overrideSetItem();
    window.addEventListener("local-storage-change", loadWidgets);
  });

  // Cleanup when the component is destroyed
  onDestroy(() => {
    window.removeEventListener("local-storage-change", loadWidgets);
  });
</script>

{#if $widgets.length > 0}
  <div class="p-6 border border-gray-300 rounded-lg bg-gray-50 max-w-6xl mx-auto h-full flex flex-col">
    <div class="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-4 mt-4 w-full px-4 md:px-2 lg:px-0">
      {#each getPagedWidgets($currentPage, $widgets) as widget, index (widget.id)}
        <div class="w-full">
          <Widget goalType={widget.goalType} color={widget.color} inputs={widget.inputs} />
        </div>
      {/each}
    </div>

    <!-- Pagination Buttons -->
    <div class="flex justify-between mt-4 px-4 md:px-2 lg:px-0">
      <button class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50" on:click={prevPage} disabled={$currentPage === 1}>
        Previous
      </button>

      <span class="text-gray-700">Page {$currentPage} of {Math.ceil($widgets.length / widgetsPerPage)}</span>

      <button class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50" on:click={nextPage} disabled={$currentPage === Math.ceil($widgets.length / widgetsPerPage)}>
        Next
      </button>
    </div>
  </div>
{:else}
  <div class="bg-gray-50 flex-grow flex items-center justify-center h-full">
    <div class="bg-gray-200 p-8 rounded-lg w-full max-w-lg text-center">
      <h1 class="text-red-500 font-bold">No widgets configured.</h1>
    </div>
  </div>
{/if}
