<script>
  import WidgetInspecter from "./lib/WidgetInspecter.svelte";
  import Sidebar from "./lib/Sidebar.svelte";
  let currentPage = 1;
</script>

<div class="container-fluid">
  <WidgetInspecter currentPage={currentPage}/>

  <Sidebar currentPage={currentPage}/>
</div>

<style>
  .container-fluid {
    height: 100%;
    display: flex;
  }

  .main-container {
    flex: 1;
    margin-left: var(--sidebar-width);
    transition: margin-left 0.3s ease;
  }
</style>
