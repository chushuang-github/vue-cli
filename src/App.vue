<template>
  <h2 class="title">Hello App</h2>
  <el-button type="primary">Primary</el-button>

  <ul>
    <li><router-link to="/home">Home</router-link></li>
    <li><router-link to="/about">About</router-link></li>
  </ul>

  <router-view></router-view>
</template>

<script>
import { ElButton } from 'element-plus'
export default {
  name: 'App',
  components: {
    ElButton
  }
}
</script>

<style scoped lang="less">
.title {
  color: orange;
}
</style>
