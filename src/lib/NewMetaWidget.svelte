<script>
    import { onMount } from "svelte";
    import { widgets, loadWidgets, saveWidgets } from './store.js';
    import { get } from 'svelte/store';
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    export let currentWidgetIndex = null;
    let widgetType = "";
    let goalType = "";
    let inputs = [];
    let newInputType = "text";
    let newLabel = "";
    let color = "#ffffff";
    let min = "";
    let max = "";
    let options = "";
    let notes = "";
    let goalAccomplished = false;

    // Notification state
    let notificationMessage = "";
    let showNotification = false;
    let notificationColor = "green"; // Default is green for success

    // Default inputs for each widget type
    const defaultInputs = {
        sleep: [{ type: "number", label: "Hours of Sleep", min: 0 }],
        water: [{ type: "number", label: "Liters of Water", min: 0 }],
    };

    // Load widget configurations from store
    onMount(() => {
        loadWidgets(); // Load widgets from localStorage
    });

    // Add or update a widget configuration
    function saveWidget() {
        // Validate the form fields
        if (!widgetType || !goalType || !color) {
            showNotificationMessage(
                "Please fill in all required fields.",
                "red",
            );
            return;
        }

        // Create the widget object
        const widget = {
            widgetType,
            goalType,
            inputs: [...(defaultInputs[widgetType] || []), ...inputs],
            color,
            notes,
        };

        // Fetch the current widgets from the store
        const currentWidgets = get(widgets);

        if (currentWidgetIndex === null) {
            widget.id = currentWidgets.length; // Assign an ID based on length
            currentWidgets.push(widget);
        } else {
            currentWidgets[currentWidgetIndex] = { ...currentWidgets[currentWidgetIndex], ...widget };
        }

        saveWidgets(currentWidgets); // Save updated widgets to local storage

        addGoalAccomplishedCheckbox();
        addNotesInput();
        resetForm();
        dispatch("local-storage-change");

        // Show success notification
        showNotificationMessage("Created widget!", "green");
    }

    // Add "Goal Accomplished" checkbox to the widget in store
    function addGoalAccomplishedCheckbox() {
        const currentWidgets = get(widgets);
        currentWidgets.forEach((widget) => {
            const hasGoalAccomplished = widget.inputs.some(
                (input) => input.label === "Did you accomplish your goal?",
            );
            if (!hasGoalAccomplished) {
                widget.inputs.push({
                    type: "checkbox",
                    label: "Did you accomplish your goal?",
                    checked: false,
                });
            }
        });
        saveWidgets(currentWidgets); // Save updated widgets to local storage
    }

    // Add "Notes" input to the widget in store
    function addNotesInput() {
        const currentWidgets = get(widgets);
        currentWidgets.forEach((widget) => {
            const hasNotesInput = widget.inputs.some(
                (input) => input.label === "notes",
            );
            if (!hasNotesInput) {
                widget.inputs.push({
                    type: "textarea",
                    label: "notes",
                    value: widget.notes || "",
                });
            }
        });
        saveWidgets(currentWidgets); // Save updated widgets to local storage
    }

    // Show notification message with color
    function showNotificationMessage(message, color) {
        notificationMessage = message;
        notificationColor = color;
        showNotification = true;

        // Hide the notification after 3 seconds
        setTimeout(() => {
            showNotification = false;
        }, 3000);
    }

    // Reset the form
    function resetForm() {
        currentWidgetIndex = null;
        widgetType = "";
        goalType = "";
        inputs = [];
        color = "#ffffff";
        newInputType = "text";
        newLabel = "";
        min = "";
        max = "";
        options = "";
        notes = "";
        goalAccomplished = false; // Reset checkbox
    }

    // Add a new input field
    function addInput() {
        if (newLabel) {
            inputs = [
                ...inputs,
                { type: newInputType, label: newLabel, min, max, options },
            ];
            showNotificationMessage(`Added input: "${newLabel}"`, "green");
            newLabel = "";
            min = "";
            max = "";
            options = "";
        } else {
            showNotificationMessage("Input label cannot be empty!", "red");
        }
    }

    // Remove an input field
    function removeInput(index) {
        inputs = inputs.filter((_, i) => i !== index);
        // Update the current widget in the widgets array
        if (currentWidgetIndex !== null) {
            const currentWidgets = get(widgets);
            currentWidgets[currentWidgetIndex].inputs = inputs;
            saveWidgets(currentWidgets); // Save updated widgets to local storage
        }
    }

    // Initialize form with selected widget data if editing
    if (currentWidgetIndex !== null) {
        const currentWidgets = get(widgets);
        const widget = currentWidgets[currentWidgetIndex];
        widgetType = widget.widgetType;
        goalType = widget.goalType;
        // Include default inputs when editing
        inputs = widget.inputs.filter(
            (input) =>
                !defaultInputs[widget.widgetType]?.some(
                    (defaultInput) => defaultInput.label === input.label,
                ),
        );
        color = widget.color;
        notes = widget.notes || "";
    }
</script>

<div class="p-4 bg-white rounded-xl shadow-md space-y-4 overflow-auto h-full flex flex-col relative">
    <h2 class="text-lg font-semibold mb-4">
        {currentWidgetIndex === null ? "Add New Widget" : "Edit Widget"}
    </h2>

    <!-- Notification -->
    {#if showNotification}
        <div class="absolute top-0 left-0 w-full px-4 py-2 text-white text-center rounded-md transition-all duration-300"
            style="background-color: {notificationColor}; transform: translateY({showNotification ? '0%' : '-100%'})">
            {notificationMessage}
        </div>
    {/if}

    <div class="space-y-4 flex-grow">
        <div>
            <label for="widgetType" class="block text-sm font-medium">Widget Type:</label>
            <select id="widgetType" bind:value={widgetType} class="w-full h-10 p-2 border border-gray-300 rounded-md" required>
                <option value="">Select a type</option>
                <option value="habit">Habit Tracker</option>
                <option value="goal">Goal Tracker</option>
                <option value="learning">Learning Progress</option>
                <option value="reflection">Daily Reflection</option>
                <option value="sleep">Sleep Tracking</option>
                <option value="water">Water Intake</option>
            </select>
        </div>

        {#if widgetType}
            <div>
                <label for="goalType" class="block text-sm font-medium">Goal Type:</label>
                <input id="goalType" type="text" required bind:value={goalType} placeholder="Enter goal type"
                    class="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200" />
            </div>
        {/if}

        {#if ["habit", "goal", "learning", "sleep", "water"].includes(widgetType)}
            <div class="flex items-center space-x-4">
                <div class="flex-1">
                    <label for="newInputType" class="block text-sm font-medium">Input Type:</label>
                    <select id="newInputType" bind:value={newInputType} class="w-full h-10 p-2 border border-gray-300 rounded-md">
                        <option value="text">Short Text</option>
                        <option value="textarea">Long Text</option>
                        <option value="number">Number</option>
                        <option value="range">Range</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="select">Select</option>
                    </select>
                </div>

                <div class="flex-1">
                    <label for="newLabel" class="block text-sm font-medium">Input Label:</label>
                    <input id="newLabel" type="text" bind:value={newLabel} placeholder="Input label"
                        class="w-full h-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200" />
                </div>

                <div>
                    <button class="h-10 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" on:click={addInput}>Add</button>
                </div>
            </div>
        {/if}

        {#if newInputType === "range"}
            <div class="mt-4">
                <label for="min" class="block text-sm font-medium">Min Value:</label>
                <input id="min" type="number" bind:value={min} placeholder="Minimum value" class="w-full h-10 p-2 border border-gray-300 rounded-md" />
            </div>
            <div class="mt-4">
                <label for="max" class="block text-sm font-medium">Max Value:</label>
                <input id="max" type="number" bind:value={max} placeholder="Maximum value" class="w-full h-10 p-2 border border-gray-300 rounded-md" />
            </div>
        {/if}

        {#if newInputType === "select"}
            <div class="mt-4">
                <label for="options" class="block text-sm font-medium">Options (comma-separated):</label>
                <input id="options" type="text" bind:value={options} placeholder="Option 1, Option 2"
                    class="w-full h-10 p-2 border border-gray-300 rounded-md" />
            </div>
        {/if}

        {#if inputs.length > 0 || (defaultInputs[widgetType] && defaultInputs[widgetType].length > 0)}
            <h3 class="text-lg font-medium mt-4">Inputs</h3>
            <ul class="list-disc list-inside">
                {#each (defaultInputs[widgetType] || []) as defaultInput}
                    <li>{defaultInput.label} ({defaultInput.type})</li>
                {/each}
                {#each inputs as input, index}
                    <li>{input.label} ({input.type}) <button on:click={() => removeInput(index)} class="text-red-500 ml-2">Remove</button></li>
                {/each}
            </ul>
        {/if}

        <div class="mt-4">
            <label for="color" class="block text-sm font-medium">Color:</label>
            <input type="color" id="color" bind:value={color} class="h-10 w-full p-0 border border-gray-300 rounded-md" />
        </div>

        <div class="mt-4">
            <label for="notes" class="block text-sm font-medium">Notes:</label>
            <textarea id="notes" bind:value={notes} rows="3" placeholder="Enter any notes"
                class="w-full p-2 border border-gray-300 rounded-md"></textarea>
        </div>
    </div>

    <div class="flex justify-end mt-6">
        <button class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600" on:click={saveWidget}>
            {currentWidgetIndex === null ? "Create Widget" : "Update Widget"}
        </button>
    </div>
</div>
