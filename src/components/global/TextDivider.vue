<template>
  <div class="text-divider">
    <div class="text">
      <slot />
    </div>
    <div class="after-text">
        <slot name="after" />
    </div>
  </div>
</template>
<script>
export default {
  name: "text-divider"
};
</script>