<template>
  <v-navigation-drawer
    v-model="drawer"
    :right="getRTL"
    v-if="value"
    height="calc(100% - 25px)"
    top="100%"
    :class="`idea-content-navigation-drawer-${side}`"
    :touchless="items.length === 0"
    click.stop
  >

    <v-list
      dense
      v-if="getItems.length > 0"
      :class="`idea-content-navigation-drawer-container-${side}`"
    >
      <v-list-group
        v-for="(item, key) in getItems"
        :key="`title-${key}-${item.id}`"
        style="font-size: 25px; font-family: 'FuturaBold'"
        :class="'sideContent-navigate-item-' + item.level"
        class="sideContent-navigate-title"
        :append-icon="getAppendIcon(item)"
      >
        <template v-slot:activator>
          <v-list-item-title
            class="content-sidebar-idea-title"
            @click="setScrollTo(item)"
          >
            <div
              class="idea_content_sidebar_content_type_select_container"
              v-if="side === 'right'"
            >
              <v-radio-group v-model="selectedType">
                <v-radio :value="item.id" />
              </v-radio-group>
            </div>
            <div
              :class="{
                'idea_content_item--last': key === getItems.length - 1,
              }"
              :style="
                item.id === getSelectedContentType && side === 'right'
                  ? ' color: #4292cd'
                  : ''
              "
              class="idea_content_sidebar_content_type_select_container-text"
            >
              {{ item.text }}
            </div>
          </v-list-item-title>
        </template>

        <v-list-item
          v-for="subItem in item.subItems"
          class="sideContent-navigate-subItem"
          :class="`sideContent-navigate-subItem-${subItem.level}`"
          :key="`title-${key}-${subItem.id}`"
        >
          <v-list-item-content>
            <v-list-item-title
              v-text="subItem.text"
              @click.stop="setScrollTo(subItem)"
            ></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-group>
    </v-list>
    <v-list v-else class="sideContent-navigate-empty">
      <v-list-item-title>{{ $t("Looks empty...") }}.</v-list-item-title>
      <v-list-item-title style="white-space: normal">{{
        $t("Try adding few titles...")
      }}</v-list-item-title>
    </v-list>
        <slot></slot>
  </v-navigation-drawer>
</template>

<script>
export default {
  props: {
    items: {
      required: false,
      type: Array,
      default: () => [],
    },
    value: {
      type: Boolean,
      default: () => false,
    },
    side: {
      type: String,
      default: () => null,
    },
    selectedContentType: {
      type: String,
      default: () => null,
    },
  },

  data: () => ({
    drawer: null,
    checked: false,
    selectedItem: null,
    selectedType: null,
  }),

  mounted() {
    const selected = this.items.find(
      (item) => item.text === this.selectedContentType
    );

    if (this.items.length > 0) {
      if (selected) {
        this.selectedType = selected.id;
      } else {
        this.selectedType = this.items[0].id;
      }
    }
  },

  methods: {
    getAppendIcon(item) {
      return item.type === "heading" && item.subItems.length > 0
        ? "$expand"
        : "";
    },
    setScrollTo(item) {
      this.selectedType = item.id;
      this.$emit("navigateToContent", item);
    },
    setTypeActive(type) {
      this.$emit("setType", type);
    },
  },
  watch: {
    getValue: {
      handler(newVal) {
        this.drawer = newVal;
      },
    },
  },

  computed: {
    getSelectedContentType: {
      get() {
        const selected = this.items.find(
          (x) => x.text === this.selectedContentType
        );

        if (selected) {
          return selected.id;
        }
        return this.items && this.items.length > 0 ? this.items[0].id : null;
      },
    },
    getItems: {
      get() {
        const indexedItems = this.items.map((item, index) => {
          return { ...item, index };
        });

        const chapterItem = (item) => {
          return {
            ...item,
            subItems: [],
          };
        };

        const arrangedItems = [];

        let currentChapterIndex = -1;

        indexedItems.forEach((item) => {
          if (item.level === 1) {
            arrangedItems.push(chapterItem(item));
            currentChapterIndex += 1;
          }
          if (item.level === 2 || item.level === 3) {
            const chapterItem = arrangedItems[currentChapterIndex];
            if (chapterItem) {
              chapterItem.subItems = [...chapterItem.subItems, item];
            }
          }
        });

        return arrangedItems;
      },
    },
    getValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("close", value);
      },
    },
    getRTL: {
      get() {
        return this.side && this.side === "right" ? true : false;
      },
    },
  },
};
</script>


<style lang="scss">
.idea_content_sidebar_content_type_select_container-text {
  overflow: hidden;
  height: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  border-bottom: 1px solid lightgray;
  width: 100%;
  &.idea_content_item--last {
    border-bottom: none;
  }
}
.idea-content-navigation-drawer-container-right {
  margin: 20px 0;
}
.idea_content_sidebar_content_type_select_container {
  margin-left: 10px;
  color: #4292cd;
}

.idea-content-navigation-drawer-container-left {
  margin: 20px;
}
.idea-content-navigation-drawer-left,
.idea-content-navigation-drawer-right {
  height: calc(89.5% - 50px) !important;
  top: calc(13.2%) !important;
  position: absolute !important;
}
.sideContent-navigate-title > .v-list-group__header {
  padding: 0;
}
.v-icon.notranslate.mdi.mdi-chevron-down.theme--light {
  color: #4294d0;
}
.theme--light.v-list-item:hover::before {
  background: #fff;
}
.idea-content-navigation-drawer-left {
  border-right: 8px solid #000;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
}

.idea-content-navigation-drawer-right {
  border-left: 8px solid #4294d0;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}

.sideContent-navigate-item-1
  > .v-list-group__header
  > .content-sidebar-idea-title {
  color: #242526 !important;
  font-size: 12px !important;
  font-family: FuturaLight !important;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  cursor: pointer;
  display: flex;
  height: 50px;
  align-items: center;
  margin-left: 0;
}

.sideContent-navigate-empty {
  margin: 20px;
}

.sideContent-navigate-subItem-2,
.sideContent-navigate-subItem-3 {
  height: 20px;
  border-top: 1px solid white;
  font-family: "FuturaLight";
  font-size: 12px;
  padding: 0 10px;
}

.sideContent-navigate-subItem-3 > .v-list-item__content > .v-list-item__title {
  color: #4294d0 !important;
  font-size: 12px !important;
  font-family: FuturaMedium !important;
  font-weight: 400;
  cursor: pointer;
}
.sideContent-navigate-subItem-2 > .v-list-item__content > .v-list-item__title {
  color: #242526 !important;
  font-size: 12px !important;
  font-family: FuturaMedium !important;
  font-weight: 400;
  cursor: pointer;
}
</style>
