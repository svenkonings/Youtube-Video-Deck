<svelte:options immutable/>
<div class="relative w-full h-full">
  <slot name="before"/>
  <div class="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-center">
    <slot/>
  </div>
  <slot name="after"/>
</div>
