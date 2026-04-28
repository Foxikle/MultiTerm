<script lang="ts">
  import {page} from '$app/state';
</script>

<div class="h-screen font-title bg-bg flex flex-col justify-center items-center gap-6">
  <span>
    <h1 class="text-primary text-shadow-sm text-shadow-muted text-6xl">
      That's an error: {page.status}
    </h1>
    <p class="text-secondary text-3xl">
      {page.error.message}
    </p>
  </span>
  <span class="text-2xl text-muted italic underline">
    <a href="/">Go Home</a>
  </span>
</div>

