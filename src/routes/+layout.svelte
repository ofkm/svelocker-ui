<script>
    let { children } = $props();
    import "../app.css";
    import Header from '$lib/components/header/header.svelte';
  </script>

<div class="relative flex flex-col mx-auto w-full text-sm sm:text-base min-h-screen max-h-screen">
    <Header />
    {@render children()}
</div>
  
  