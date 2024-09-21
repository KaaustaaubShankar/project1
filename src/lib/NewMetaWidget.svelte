<script>
    import { onMount, createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    export let currentPage;
    let widgets = [];
    let currentWidgetIndex = null;
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
        sleep: [{ type: 'number', label: 'Hours of Sleep', min: 0 }],
        water: [{ type: 'number', label: 'Liters of Water', min: 0 }],
    };

    // Load widget configurations from local storage
    function loadConfigs() {
        const savedWidgets = localStorage.getItem("widgets");
        if (savedWidgets) {
            widgets = JSON.parse(savedWidgets);
        }
    }

    // Save widget configurations to local storage
    function saveConfigs() {
        localStorage.setItem("widgets", JSON.stringify(widgets));
    }

    // Add or update a widget configuration
    function saveWidget() {
        // Validate the form fields
        if (!widgetType || !goalType || !color) {
            showNotificationMessage("Please fill in all required fields.", "red");
            return;
        }

        // Create the widget object
        const widget = {
            widgetType,
            goalType,
            inputs: [...(defaultInputs[widgetType] || []), ...inputs],
            color,
            notes
        };

        if (currentWidgetIndex === null) {
            widgets = [...widgets, widget];
        } else {
            widgets[currentWidgetIndex] = widget;
            widgets = [...widgets];
        }

        saveConfigs();
        addGoalAccomplishedCheckbox();
        addNotesInput();
        resetForm();
        dispatch('local-storage-change');

        // Show success notification
        showNotificationMessage("Created widget!", "green");
        currentPage = 2;
        
    }

    // Add "Goal Accomplished" checkbox to the widget in local storage
    function addGoalAccomplishedCheckbox() {
        widgets = widgets.map(widget => {
            if (widget.widgetType === 'goal' || widget.widgetType === 'habit' || widget.widgetType === 'sleep' || widget.widgetType === 'water') {
                // Add "Goal Accomplished" checkbox if it's not already included
                const hasGoalAccomplished = widget.inputs.some(input => input.label === 'Did you accomplish your goal?');
                if (!hasGoalAccomplished) {
                    widget.inputs = [...widget.inputs, { type: 'checkbox', label: 'Did you accomplish your goal?', checked: false }];
                }
            }
            return widget;
        });
        saveConfigs();
    }

    // Add "Notes" input to the widget in local storage
    function addNotesInput() {
        widgets = widgets.map(widget => {
            // Add a "Notes" textarea input if it's not already included
            const hasNotesInput = widget.inputs.some(input => input.label === 'notes');
            if (!hasNotesInput) {
                widget.inputs = [...widget.inputs, { type: 'textarea', label: 'notes', value: widget.notes || "" }];
            }
            return widget;
        });
        saveConfigs();
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
            inputs = [...inputs, { type: newInputType, label: newLabel, min, max, options }];
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
    }

    onMount(() => {
        loadConfigs();

        // Initialize form with selected widget data if editing
        if (currentWidgetIndex !== null) {
            const widget = widgets[currentWidgetIndex];
            widgetType = widget.widgetType;
            goalType = widget.goalType;
            inputs = widget.inputs.filter(input => !defaultInputs[widget.widgetType]?.some(defaultInput => defaultInput.label === input.label));
            color = widget.color;
            notes = widget.notes || "";
        } else if (widgetType === 'sleep' || widgetType === 'water') {
            // Set default inputs if creating a new widget
            inputs = [];
        }

        // Listen for changes to local storage
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    });

    function handleStorageChange(event) {
        if (event.storageArea === localStorage) {
            loadConfigs();
        }
    }
</script>

<div class="p-4 bg-white rounded-xl shadow-md space-y-4 overflow-auto h-full flex flex-col relative">
    <h2 class="text-lg font-semibold mb-4">
        {currentWidgetIndex === null ? "Add New Widget" : "Edit Widget"}
    </h2>

    <!-- Notification -->
    {#if showNotification}
        <div 
            class="absolute top-0 left-0 w-full px-4 py-2 text-white text-center rounded-md transition-all duration-300"
            style="background-color: {notificationColor}; transform: translateY({showNotification ? '0%' : '-100%'})">
            {notificationMessage}
        </div>
    {/if}

    <div class="space-y-4 flex-grow">
        <div>
            <label for="widgetType" class="block text-sm font-medium">Widget Type:</label>
            <select
                id="widgetType"
                bind:value={widgetType}
                class="w-full h-10 p-2 border border-gray-300 rounded-md"
                required
            >
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
                <input
                    id="goalType"
                    type="text"
                    required
                    bind:value={goalType}
                    placeholder="Enter goal type"
                    class="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                />
            </div>
        {/if}

        {#if widgetType === 'habit' || widgetType === 'goal' || widgetType === 'learning' || widgetType === 'sleep' || widgetType === 'water'}
            <div class="flex items-center space-x-4">
                <div class="flex-1">
                    <label for="newInputType" class="block text-sm font-medium">Input Type:</label>
                    <select
                        id="newInputType"
                        bind:value={newInputType}
                        class="w-full h-10 p-2 border border-gray-300 rounded-md"
                    >
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
                    <input
                        id="newLabel"
                        type="text"
                        bind:value={newLabel}
                        placeholder="Input label"
                        class="w-full h-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                    />
                </div>

                <div>
                    <button
                        class="h-10 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        on:click={addInput}>Add</button
                    >
                </div>
            </div>
        {/if}

        {#if newInputType === 'range'}
            <div class="mt-4">
                <label for="min" class="block text-sm font-medium">Min:</label>
                <input
                    id="min"
                    type="number"
                    bind:value={min}
                    placeholder="Minimum value"
                    class="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                />
                <label for="max" class="block text-sm font-medium mt-2">Max:</label>
                <input
                    id="max"
                    type="number"
                    bind:value={max}
                    placeholder="Maximum value"
                    class="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                />
            </div>
        {/if}

        {#if newInputType === 'select'}
            <div class="mt-4">
                <label for="options" class="block text-sm font-medium">Options (comma separated):</label>
                <input
                    id="options"
                    type="text"
                    bind:value={options}
                    placeholder="Option1, Option2, Option3"
                    class="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                />
            </div>
        {/if}

        <!-- Added Inputs Display -->
        {#if (defaultInputs[widgetType] || []).length > 0 || inputs.length > 0}
            <div class="mt-4">
                <h3 class="text-sm font-semibold">Inputs:</h3>
                <ul class="list-disc list-inside">
                    {#each (defaultInputs[widgetType] || []) as input}
                        <li>
                            {input.label} - {input.type}
                            {#if input.type === 'range'}
                                (Min: {input.min} Max: {input.max})
                            {/if}
                            {#if input.type === 'select'}
                                (Options: {input.options})
                            {/if}
                        </li>
                    {/each}
                    {#each inputs as input, index}
                        <li>
                            {input.label} - {input.type}
                            {#if input.type === 'range'}
                                (Min: {input.min} Max: {input.max})
                            {/if}
                            {#if input.type === 'select'}
                                (Options: {input.options})
                            {/if}
                            <button on:click={() => removeInput(index)} class="text-red-500 ml-2">Remove</button>
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}

        <div class="mt-4">
            <label for="color" class="block text-sm font-medium">Widget Color:</label>
            <input
                id="color"
                type="color"
                bind:value={color}
                class="mt-1 w-16 h-8 p-1"
            />
        </div>

        <div class="flex justify-between mt-6">
            <button
                class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                on:click={saveWidget}>Save Widget</button
            >
            <button
                class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                on:click={resetForm}>Cancel</button
            >
        </div>
    </div>
</div>
