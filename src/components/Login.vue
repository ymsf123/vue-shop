<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avater_box">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 表单区域 -->
      <el-form
        label-width="0px"
        class="form_box"
        :model="formdata"
        :rules="loginformRules"
        ref="loginformRef"
      >
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user-solid" v-model="formdata.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-unlock" v-model="formdata.password" type="password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <div class="btns">
          <el-form-item>
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="resetForm">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      formdata: {
        username: 'admin',
        password: '123456'
      },
      // 表单的规则验证
      loginformRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetForm: function () {
      this.$refs.loginformRef.resetFields()
    },
    login: function () {
      this.$refs.loginformRef.validate(async (vali) => {
        if (!vali) return
        if (vali) {
          const { data: res } = await this.$http.post('login', this.formdata)
          if (res.meta.status !== 200) {
            return this.$message.error('登录失败')
          } else {
            this.$message.success('登录成功')
            window.sessionStorage.setItem('token', res.data.token)
            this.$router.push('/home')
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  width: 100%;
  background-color: #2b4b6b;
}
.login_box {
  height: 300px;
  width: 450px;
  background-color: #fff;
  border-radius: 3px;
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .avater_box {
    width: 130px;
    height: 130px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ccc;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #ccc;
    }
  }
}
.form_box {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 20px;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
