<style>
@import '../../assets/css/project.css';
</style>

<template>
  <default-layout>
    <home />
    <router-view></router-view>
  </default-layout>
</template>
<script>

import Home from "./Home";

export default {
  components: {
    home: Home
  }
};
</script>