<template>
  <div class="sweepable" style="flex: 1 1 auto; width: 100%">
    <slot />
  </div>
</template>
<script>
export default {
  name: "sweepable",
  props: {
    disabled: {
      required: false,
      type: Boolean,
      default: () => false,
    },
  },
  data: () => ({
    touching: false,
    pStart: { x: 0, y: 0 },
    pCurrent: { x: 0, y: 0 },
    threshold: 100,
  }),
  mounted() {
    this.putListeners();
  },
  beforeDestroy() {
    this.removeListeners();
  },
  methods: {
    putListeners() {
      this.$el.addEventListener("touchstart", (e) => this.swipeStart(e), false);
      this.$el.addEventListener("touchmove", (e) => this.swipe(e), false);
      this.$el.addEventListener("touchend", (e) => this.swipeEnd(e), false);
    },
    removeListeners() {
      this.$el.removeEventListener(
        "touchstart",
        (e) => this.swipeStart(e),
        false
      );
      this.$el.removeEventListener("touchmove", (e) => this.swipe(e), false);
      this.$el.removeEventListener("touchend", (e) => this.swipeEnd(e), false);
    },
    swipeStart(e) {
      const slice = e.path.slice(0, 3);

      if (slice) {
        for (let i = 0; slice.length > i; i++) {
          if (
            slice[i].nodeName == "TD" ||
            slice[i].nodeName == "TR" ||
            slice[i].nodeName == "TBODY"
          ) {
            this.$emit("disableSwipe", true);
          } else {
            this.$emit("disableSwipe", false);
          }
        }
      }

      if (this.disabled) {
        return;
      }
      if (typeof e["targetTouches"] !== "undefined") {
        let touch = e.targetTouches[0];
        this.pStart.x = touch.screenX;
        this.pStart.y = touch.screenY;
      } else {
        this.pStart.x = e.screenX;
        this.pStart.y = e.screenY;
      }
    },

    swipeEnd() {
      if (this.disabled) {
        return;
      }
      if (this.pCurrent.x === 0) {
        return;
      }
      let changeY =
        this.pStart.y != this.pCurrent.y ? this.pStart.y - this.pCurrent.y : 0;
      let changeX =
        this.pStart.x != this.pCurrent.x ? this.pStart.x - this.pCurrent.x : 0;
      //const rotation = changeY < 100 ? (changeY * 30) / 100 : 30;\\

      if (Math.abs(changeY) > this.threshold) {
        this.doSweep(changeY > 0 ? "up" : "down");
      }
      if (Math.abs(changeX) > this.threshold) {
        this.doSweep(changeX > 0 ? "left" : "right");
      }

      if (
        Math.abs(changeY) <= this.threshold &&
        Math.abs(changeX) <= this.threshold
      ) {
        this.touching = false;
      }

      this.pStart = { x: 0, y: 0 };
      this.pCurrent = { x: 0, y: 0 };
    },
    swipe(e) {
      if (this.disabled) {
        return;
      }
      if (typeof e["changedTouches"] !== "undefined") {
        let touch = e.changedTouches[0];
        this.pCurrent.x = touch.screenX;
        this.pCurrent.y = touch.screenY;
      } else {
        this.pCurrent.x = e.screenX;
        this.pCurrent.y = e.screenY;
      }
      //   let changeY =
      //     this.pStart.y < this.pCurrent.y
      //       ? Math.abs(this.pStart.y - this.pCurrent.y)
      //       : 0;
      //   this.touching = true;
      //   if (changeY > 5) {
      //     this.touching = true;
      //   } else {
      //     this.touching = false;
      //   }
    },
    async doSweep(direction) {
      try {
        this.$emit("sweep", direction);
        this.setTimeout(() => {
          this.touching = false;
        }, 500);
      } catch {
        this.touching = false;
      }
    },
  },
};
</script>