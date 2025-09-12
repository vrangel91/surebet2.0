<template>
  <div 
    ref="container" 
    class="virtual-scroll-container"
    @scroll="handleScroll"
    :style="{ height: containerHeight + 'px' }"
  >
    <!-- Spacer para simular altura total -->
    <div :style="{ height: totalHeight + 'px' }">
      <!-- Conteúdo visível -->
      <div 
        class="virtual-scroll-content"
        :style="{ 
          transform: `translateY(${offsetY}px)`,
          height: visibleHeight + 'px'
        }"
      >
        <slot 
          v-for="(item, index) in visibleItems" 
          :key="getItemKey(item, startIndex + index)"
          :item="item"
          :index="startIndex + index"
          :is-visible="true"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VirtualScroll',
  props: {
    items: {
      type: Array,
      required: true
    },
    itemHeight: {
      type: Number,
      default: 200
    },
    containerHeight: {
      type: Number,
      default: 600
    },
    overscan: {
      type: Number,
      default: 5
    }
  },
  data() {
    return {
      scrollTop: 0
    }
  },
  computed: {
    totalHeight() {
      return this.items.length * this.itemHeight
    },
    
    visibleCount() {
      return Math.ceil(this.containerHeight / this.itemHeight) + this.overscan * 2
    },
    
    startIndex() {
      return Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.overscan)
    },
    
    endIndex() {
      return Math.min(this.items.length - 1, this.startIndex + this.visibleCount)
    },
    
    visibleItems() {
      return this.items.slice(this.startIndex, this.endIndex + 1)
    },
    
    offsetY() {
      return this.startIndex * this.itemHeight
    },
    
    visibleHeight() {
      return this.visibleItems.length * this.itemHeight
    }
  },
  methods: {
    handleScroll(event) {
      this.scrollTop = event.target.scrollTop
    },
    
    getItemKey(item, index) {
      // Usar uma propriedade única do item ou o índice
      return item.id || item.key || index
    },
    
    scrollToIndex(index) {
      if (this.$refs.container) {
        const scrollTop = index * this.itemHeight
        this.$refs.container.scrollTop = scrollTop
      }
    },
    
    scrollToTop() {
      if (this.$refs.container) {
        this.$refs.container.scrollTop = 0
      }
    }
  }
}
</script>

<style scoped>
.virtual-scroll-container {
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

.virtual-scroll-content {
  position: relative;
  will-change: transform;
}

/* Otimizações de performance */
.virtual-scroll-container {
  contain: layout style paint;
}

.virtual-scroll-content {
  contain: layout style paint;
}

/* Scrollbar personalizada */
.virtual-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.virtual-scroll-container::-webkit-scrollbar-track {
  background: var(--bg-tertiary, #f1f1f1);
  border-radius: 4px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb {
  background: var(--accent-primary, #007bff);
  border-radius: 4px;
}

.virtual-scroll-container::-webkit-scrollbar-thumb:hover {
  background: var(--accent-secondary, #0056b3);
}
</style>
