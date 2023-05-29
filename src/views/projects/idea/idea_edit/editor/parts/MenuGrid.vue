<template>
  <div>
    <button
      class="menu-grid"
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
      class="menu-grid-items"
      triggers="click"
      boundary="window"
      :target="() => $refs.menuListButtonHeading"
      placement="bottom"
    >
      <b-card no-body style="align-items: center; width: 150px">
        <b-container class="bv-example-row">
          <b-row cols="3" class="menu-grid-item-row">
            <b-col
              v-for="(listItem, index) in item.listItems"
              :key="index"
              :class="`menu-grid-item menu-grid-item-${
                listItem.title
              } ${isTableActive()}`"
              @click="invokeGridItemAction(listItem, index)"
            >
              <svg class="remix">
                <use :xlink:href="`${remixiconUrl}#ri-${listItem.icon}`" />
              </svg>
            </b-col>
          </b-row>
        </b-container>
      </b-card>
    </b-popover>
  </div>
</template>

<script>
import remixiconUrl from "@/assets/img/remixicon.symbol.svg";

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  methods: {
    isTableActive() {
      const table = this.item.listItems.find((t) => t.title == "table");
      return table.isActive() ? "table-active" : "table-not-active";
    },
    invokeGridItemAction(listItem, index) {
      // if (this.isTableActive()) {
      listItem.action();
      // if (!this.selectionOpen) {
      //   this.$emit("close");
      // }
      //  }
    },
    toggleSelection() {
      this.selectionOpen = !this.selectionOpen;
    },
  },
  data() {
    return {
      selectionOpen: false,
      remixiconUrl,
    };
  },
};
</script>

<style lang="scss">
.remix {
  width: 20px;
  height: 20px;
}

.menu-grid-item:hover {
  background: #4294d0;
  color: #fff;
}

.menu-grid-items {
  position: fixed;
  background: #fff;
  color: #000;
  cursor: pointer;
  border: 1px solid #000;
}
.menu-grid-item {
  padding: 5px 10px;
  background: #fff;
  width: 100%;
  cursor: pointer;
  &.table-not-active:not(.menu-grid-item-table) {
    background: lightgray;
    cursor: not-allowed;
  }
  &.table-active:not(.menu-grid-item-table) {
    background: #fff;
  }
}

.menu-grid {
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  z-index: 1;
  color: #0d0d0d;
  border: none;
  background-color: transparent;
  border-radius: 0.4rem;
  padding: 0.25rem;
  margin-right: 0.25rem;

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
