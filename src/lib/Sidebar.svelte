<script>
    import NewMetaWidget from "./NewMetaWidget.svelte";
    import UserContent from "./UserContent.svelte";
    export let currentPage;
  </script>
  
  <!-- Tailwind Styles -->
  <div
    class="w-96 h-auto p-6 border-2 border-gray-300 rounded-lg bg-gray-50 flex flex-col justify-between shadow-lg"
  >
    <UserContent />
    <br> <!-- Add a line break here -->
    <NewMetaWidget currentPage={currentPage} />
    <br> <!-- Add a line break here -->
  </div>
  