<template>
  <div ref="container" class="symbolic-border-container relative-position">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useSymbolicBorderRenderer } from "@/composables/useSymbolicBorderRenderer";
import { SYMBOLS } from "@/utils/symbols";

interface Props {
  idPersona: string;
  borderWidth?: number;
  textSize?: string;
  sides?: string[];
  borderColor?: string;
  glyphColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  borderWidth: 26,
  textSize: "24px",
  sides: () => ["left"],
  borderColor: "#000",
  glyphColor: "#fff",
});

let resizeObserver: ResizeObserver | null = null;

const container = ref<HTMLElement | null>(null);
const { renderBorder } = useSymbolicBorderRenderer();

const renderOptions = computed(() => ({
  number: props.idPersona || "0",
  sides: props.sides,
  symbols: SYMBOLS,
  css: {
    borderColor: props.borderColor,
    borderWidth: props.borderWidth,
    textSize: props.textSize,
    glyphColor: props.glyphColor,
    radius: 6,
  },
}));

const updateBorder = () => {
  if (container.value) {
    // Clean up previous if any handled by renderer?
    // The renderer implementation creates SVG if not exists, and updates if exists.
    // However, it uses direct DOM access.
    requestAnimationFrame(() => {
      if (container.value) renderBorder(container.value, renderOptions.value);
    });
  }
};

watch(() => props.idPersona, updateBorder);
watch(() => props.borderWidth, updateBorder);
watch(() => props.sides, updateBorder, { deep: true });

onMounted(() => {
  // Add small delay to ensure layout
  setTimeout(updateBorder, 50);

  // Resize observer to re-render
  const ro = new ResizeObserver(() => {
    requestAnimationFrame(updateBorder);
  });
  if (container.value) ro.observe(container.value);
});

onMounted(() => {
  setTimeout(updateBorder, 50);

  resizeObserver = new ResizeObserver(() => {
    requestAnimationFrame(updateBorder);
  });
  if (container.value) resizeObserver.observe(container.value);
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});
</script>

<style scoped>
.symbolic-border-container {
  min-height: 100px; /* Ensure some height for border to appear */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* SVG might overflow if not careful */
}
</style>
