<template>
  <div>
    <button
      class="menu-list"
      :class="{ 'is-active': selectionOpen }"
      @click="toggleSelection()"
      ref="menuListButtonHeading"
      :title="item.title"
    >
      <svg class="remix">
        <use :xlink:href="`${remixiconUrl}#ri-${item.icon}`" />
      </svg>
    </button>
    <b-popover
      :show="selectionOpen"
      class="menu-list-items"
      triggers="click blur"
      boundary="window"
      :target="() => $refs.menuListButtonHeading"
      placement="bottom"
    >
      <b-card no-body style="align-items: center; width: 150px">
        <div
          v-for="(listItem, index) in item.listItems"
          :key="index"
          @click="invokeListItemAction(listItem, index)"
          class="menu-list-item"
          :class="{ 'is-active': activeHeadingIndex == index }"
          :style="{
            'font-size': getHeadingFontSize(listItem),
          }"
        >
          {{ listItem.title }}
        </div></b-card
      >
    </b-popover>
  </div>
</template>

<script>
import remixiconUrl from "@/assets/img/remixicon.symbol.svg";

const fontLevels = {
  "Heading 1": 1,
  "Heading 2": 2,
  "Heading 3": 3,
  "Heading 4": 4,
  "Heading 5": 5,
  "Heading 6": 6,
};
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  methods: {
    invokeListItemAction(listItem, index) {
      this.setActiveHeadingIndex(index);
      listItem.action();
    },
    setActiveHeadingIndex(index) {
      if (this.activeHeadingIndex !== index) {
        this.activeHeadingIndex = index;
      } else {
        this.activeHeadingIndex = null;
      }
    },
    toggleSelection() {
      this.selectionOpen = !this.selectionOpen;
    },
    getHeadingFontSize(item) {
      if (!item || !item.title) return;
      let ret = "1rem";
      switch (fontLevels[item.title]) {
        case 6:
          ret = "1rem";
          break;
        case 5:
          ret = "1.25rem";
          break;
        case 4:
          ret = "1.5rem";
          break;
        case 3:
          ret = "1.75rem";
          break;
        case 2:
          ret = "2.25rem";
          break;
        case 1:
          ret = "2.5rem";
      }
      return ret;
    },
  },

  data() {
    return {
      selectionOpen: false,
      activeHeadingIndex: null,
      remixiconUrl,
    };
  },
};
</script>

<style lang="scss">
.menu-list-item.is-active {
  background: #4294d0;
  color: #fff;
}

.menu-list-item:hover {
  background: #4294d0;
  color: #fff;
}

.menu-list-items {
  position: fixed;
  background: #fff;
  color: #000;
  cursor: pointer;
  border: 1px solid #000;
}
.menu-list-item {
  padding: 5px 10px;
  width: 100%;
  cursor: pointer;
}

.menu-list {
  height: 100%;
  width: 1.75rem;
  height: 1.75rem;
	display: flex;
  z-index: 1;
  color: #0d0d0d;
  border: none;
  background-color: transparent;
  border-radius: 0.4rem;
  padding: 0.25rem;
  margin-right: 0.5rem;

  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }

  &.is-active,
  &:hover {
    color: #fff;
    background-color: #0d0d0d;
  }
}
</style>
