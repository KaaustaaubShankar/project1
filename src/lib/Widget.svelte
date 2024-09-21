<script>
  import dayjs from 'dayjs';
  import { onMount } from 'svelte';

  export let goalType = '';
  export let color = '#ffffff';
  export let inputs = [];

  let isExpanded = false;
  let selectedDate = ''; // Default date
  let pastEntries = {};
  let entriesForDate = {};
  let localValues = {}; // Object to store current input values
  let showNotification = false; // State to control notification visibility
  let inputTypes = {}; // Object to store input types for each label

  function loadSavedColor() {
    const savedWidgets = JSON.parse(localStorage.getItem('widgets')) || [];
    const currentWidget = savedWidgets.find(widget => widget.goalType === goalType);
    if (currentWidget && currentWidget.color) {
      color = currentWidget.color;
    }
  }

  function loadInputTypes() {
    const savedWidgets = JSON.parse(localStorage.getItem('widgets')) || [];
    const currentWidget = savedWidgets.find(widget => widget.goalType === goalType);

    if (currentWidget && currentWidget.inputs) {
      // Map input labels to their types
      inputTypes = currentWidget.inputs.reduce((acc, input) => {
        acc[input.label] = input.type;
        return acc;
      }, {});
      inputs = currentWidget.inputs; // Update inputs to reflect types from local storage
    }
  }

  function handleSave(event) {
    event.preventDefault();
    if (!selectedDate) {
      alert('Please select a date.');
      return;
    }
    let formData = {};

    for (const [label, value] of Object.entries(localValues)) {
      formData[label] = value;
    }

    let currentConfig = JSON.parse(localStorage.getItem(goalType)) || {};
    currentConfig[selectedDate] = formData;
    localStorage.setItem(goalType, JSON.stringify(currentConfig));
    loadPastEntries();

    // Show notification
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 2000); // Notification disappears after 2 seconds
  }

  function handleColorChange(event) {
    color = event.target.value;

    let savedWidgets = JSON.parse(localStorage.getItem('widgets')) || [];
    const currentWidgetIndex = savedWidgets.findIndex(widget => widget.goalType === goalType);
    if (currentWidgetIndex !== -1) {
      savedWidgets[currentWidgetIndex].color = color;
      localStorage.setItem('widgets', JSON.stringify(savedWidgets));
    }
  }

  function handleDelete() {
    if (confirm('Are you sure you want to delete this widget?')) {
      let savedWidgets = JSON.parse(localStorage.getItem('widgets')) || [];
      savedWidgets = savedWidgets.filter(widget => widget.goalType !== goalType);
      localStorage.setItem('widgets', JSON.stringify(savedWidgets));
      localStorage.removeItem(goalType);
      pastEntries = {};
      entriesForDate = {}; // Clear entries for the deleted widget
      loadSavedColor();
      inputs = []; // Clear inputs after deletion
    }
  }

  function toggleExpand() {
    isExpanded = !isExpanded;
  }

  function loadPastEntries() {
    pastEntries = JSON.parse(localStorage.getItem(goalType)) || {};
    // Update entriesForDate if a date is selected
    if (selectedDate) {
      entriesForDate = pastEntries[selectedDate] || {};
      localValues = { ...entriesForDate }; // Populate local values with existing data
    }
  }

  function handleDateChange(event) {
    selectedDate = dayjs(event.target.value).format('YYYY-MM-DD');
    loadPastEntries();
  }

  function handleInputChange(event) {
    const { placeholder, value, type, checked } = event.target;

    // For checkboxes, we need to save `checked` state, not `value`
    if (type === 'checkbox') {
      localValues[placeholder] = checked;
    } else {
      localValues[placeholder] = value;
    }
  }

  onMount(() => {
    loadSavedColor();
    loadInputTypes(); // Load input types from local storage
    selectedDate = dayjs().format('YYYY-MM-DD'); // Set default date to today
    loadPastEntries();
  });
</script>

<div class="relative p-2 border border-gray-300 rounded-lg w-80 h-24 flex flex-col justify-center items-center" style="background-color: {color}">
  <h3 class="text-lg font-bold truncate">{goalType}</h3>
  <button class="absolute bottom-2 right-2 bg-blue-600 text-white text-lg w-8 h-8 rounded-full hover:bg-blue-700 transition" on:click={toggleExpand}>
    +
  </button>
</div>

{#if isExpanded}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="relative p-4 border border-gray-300 rounded-lg w-96 bg-white shadow-lg" style="background-color: {color}">
      <h3 class="text-xl font-bold mb-4">{goalType}</h3>
      <div class="absolute top-2 right-2 flex items-center space-x-2">
        <input type="color" id="color" class="cursor-pointer" bind:value={color} on:change={handleColorChange} title="Change color"/>
        <button class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition" on:click={handleDelete} title="Delete">Delete</button>
        <button class="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition" on:click={toggleExpand} title="Close">Close</button>
      </div>

      <div class="mb-4">
        <h4 class="font-bold mb-2">Select a Date:</h4>
        <input
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg"
          value={selectedDate}
          on:change={handleDateChange}
        />
      </div>

      <form on:submit={handleSave} class="space-y-4 mb-6">
        {#each inputs as { type, label, min, max }}
          <div class="space-y-1">
            <label class="block font-medium">{label}</label>
            {#if type === 'checkbox'}
              <div class="flex items-center">
                <input
                  type="checkbox"
                  placeholder={label}
                  class="mr-2"
                  checked={localValues[label] || false}
                  on:input={handleInputChange}
                />
              </div>
            {:else if type === 'range'}
              <div class="flex flex-col space-y-1">
                <input
                  type="range"
                  min={min || 0}
                  max={max || 100}
                  value={localValues[label] || (min || 0)}
                  class="w-full"
                  on:input={handleInputChange}
                  placeholder={label}
                />
                <div class="flex justify-between text-sm">
                  <span>Min: {min || 0}</span>
                  <span>Value: {localValues[label] || (min || 0)}</span>
                  <span>Max: {max || 100}</span>
                  
                </div>
              </div>
            {:else}
              <input
                type={type} 
                placeholder={label}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={localValues[label] || ''}
                on:input={handleInputChange}
              />
            {/if}
          </div>
        {/each}
      
        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
          Save
        </button>
      </form>

      {#if showNotification}
        <div class="absolute top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Changes saved!
        </div>
      {/if}
    </div>
  </div>
{/if}
