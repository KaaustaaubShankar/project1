<script>
  import dayjs from 'dayjs';
  import { onMount } from 'svelte';

  let user = {
    name: "John Doe", // Replace with dynamic data
    startDate: new Date("2024-01-01"), // Replace with dynamic data
  };

  let currentDate = new Date();
  let daysSinceBeginning;
  let daysActive;
  let progressPercent;

  // Initialize state to store progress information
  let totalGoalsToday = 0;
  let completedGoalsToday = 0;

  onMount(() => {
    const updateDateTime = () => {
      currentDate = new Date();
      daysSinceBeginning = Math.floor(
        (currentDate - user.startDate) / (1000 * 60 * 60 * 24),
      );
      daysActive = daysSinceBeginning; // Assuming active every day for this example

      // Calculate progress for goals
      calculateGoalProgress();
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000); // Update every second
    return () => clearInterval(interval);
  });

  function calculateGoalProgress() {
    const today = dayjs().format('YYYY-MM-DD');
    const savedWidgets = JSON.parse(localStorage.getItem('widgets')) || [];
    
    // Reset counts
    totalGoalsToday = 0;
    completedGoalsToday = 0;

    savedWidgets.forEach(widget => {
      const widgetData = JSON.parse(localStorage.getItem(widget.goalType)) || {};
      const entriesForToday = widgetData[today] || {};

      // Check for the "Did you accomplish your goal?" checkbox
      const goalCheckbox = widget.inputs.find(input => 
        input.type === 'checkbox' && input.label === 'Did you accomplish your goal?'
      );

      if (goalCheckbox) {
        // Count how many goals have the checkbox checked
        if (entriesForToday['Did you accomplish your goal?'] === true || entriesForToday['Did you accomplish your goal?'] === 'true') {
          completedGoalsToday += 1;
        }
        totalGoalsToday += 1; // Count each checkbox as a goal
      }
    });

    // Calculate progress percent
    progressPercent = totalGoalsToday > 0 ? (completedGoalsToday / totalGoalsToday) * 100 : 0;
  }
</script>

<div class="p-4 max-w-sm mx-auto bg-white rounded-xl shadow-md space-y-4">
  <h2 class="text-xl font-semibold">User Overview</h2>
  <p class="text-gray-700">Name: {user.name}</p>
  <p class="text-gray-700">Current Date/Time: {currentDate.toLocaleString()}</p>
  <p class="text-gray-700">Days Active: {daysActive}</p>

  <!-- Progress Bar -->
  <div class="flex flex-col items-center mt-4">
    <div class="relative w-full max-w-xs">
      <div class="w-full h-4 bg-gray-200 rounded-full">
        <div class="h-full bg-blue-600 rounded-full" style="width: {progressPercent}%"></div>
      </div>
      <span class="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">{Math.round(progressPercent)}%</span>
    </div>
  </div>
</div>
