<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/heima.png" alt />
        <span>电商后台管理</span>
      </div>
      <el-button type="info" @click="loginout">退出登录</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px':'200px'">
        <el-menu
          background-color="#313743"
          text-color="#fff"
          active-text-color="#4fa3ff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 展开与收缩按钮 -->
          <div class="toggle-btn" @click="changetoggle">|||</div>
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单模板 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="menuObject[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subitem.path"
              v-for="subitem in item.children"
              :key="subitem.id"
              @click="savaPath('/'+subitem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subitem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      menulist: [],
      isCollapse: false,
      activePath: '',
      menuObject: {
        125: 'el-icon-user-solid',
        103: 'el-icon-s-management',
        101: 'el-icon-s-goods',
        102: 'el-icon-s-order',
        145: 'el-icon-s-marketing'
      }
    }
  },
  created() {
    this.getmenus()
    this.activePath = window.sessionStorage.getItem('path')
  },
  methods: {
    loginout: function () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    getmenus: async function () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
    },
    // 菜单的折叠与展开
    changetoggle: function () {
      this.isCollapse = !this.isCollapse
    },
    // 路由地址链接
    savaPath: function (path) {
      window.sessionStorage.setItem('path', path)
      this.activePath = path
    }
  }
}
</script>
<style lang="less" scoped>
.el-header {
  background-color: #363d40;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0px;
  > div {
    display: flex;
    align-items: center;
    span {
      color: #fff;
      font-size: 20px;
      margin-left: 20px;
    }
  }
}
.el-aside {
  background-color: #313743;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #e9edf1;
}
.home-container {
  height: 100%;
}
.toggle-btn {
  width: 100%;
  text-align: center;
  line-height: 100%;
  background-color: #475163;
  cursor: pointer;
}
</style>
