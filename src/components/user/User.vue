<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <div>
        <!-- 输入框区域 -->
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getuserInfo">
              <el-button slot="append" icon="el-icon-search" @click="getuserInfo"></el-button>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
          </el-col>
        </el-row>
        <!-- 用户列表区域 -->
        <el-table :data="userlist" stripe style="width: 100%" border>
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="username" label="姓名"></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
          <el-table-column prop="mobile" label="电话"></el-table-column>
          <el-table-column prop="role_name" label="角色"></el-table-column>
          <el-table-column label="状态">
            <!-- 作用域插槽 -->
            <template slot-scope="scope">
              <el-switch @change="changeUserStatus(scope.row)" v-model="scope.row.mg_state"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-tooltip
                class="item"
                effect="dark"
                content="编辑"
                placement="top"
                :enterable="false"
              >
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="editUser(scope.row.id)"
                ></el-button>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="删除"
                placement="top"
                :enterable="false"
              >
                <el-button
                  @click="deleteUser(scope.row.id)"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                ></el-button>
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="dark"
                content="分配角色"
                placement="top"
                :enterable="false"
              >
                <el-button
                  @click="allotRoles(scope.row)"
                  type="warning"
                  icon="el-icon-setting"
                  size="mini"
                ></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页区域 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 3, 5]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalpage"
        ></el-pagination>
      </div>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog @close="clearForm" title="提示" :visible.sync="dialogVisible" width="50%">
      <!-- 添加用户信息表单 -->
      <el-form
        :model="addUserForm"
        :rules="addUserrules"
        ref="addUserruleRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog
      title="编辑用户信息"
      @close="closeEditForm()"
      :visible.sync="editdialogVisible"
      width="50%"
    >
      <!-- 编辑用户信息表单 -->
      <el-form
        label-width="100px"
        class="demo-ruleForm"
        :model="editUserForm"
        :rules="editUserrules"
        ref="editUserruleRef"
      >
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      @close="clearSelectedInfo"
      title="分配角色"
      :visible.sync="allotRolesdialogVisible"
      width="50%"
    >
      <div>
        <p class="margintb">当前的用户：{{roleUserInfo.username}}</p>
        <p class="margintb">当前的角色：{{roleUserInfo.role_name}}</p>
        <p class="margintb">
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolelist"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allotRolesdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="savaUserRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 邮箱的验证规则
    var checkEmail = (rule, value, callback) => {
      var regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (regEmail.test(value)) {
        return callback()
      }
      return callback(new Error('请输入合法的邮箱地址'))
    }
    // 电话的验证规则
    var checkTel = (rule, value, callback) => {
      var regTel = /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/
      if (regTel.test(value)) {
        return callback()
      }
      return callback(new Error('请输入合法的电话号码'))
    }
    return {
      // 向服务端发送的数据
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 用户列表
      userlist: [],
      // 分配角色显示
      allotRolesdialogVisible: false,
      // 当前被分配角色的用户信息
      roleUserInfo: [],
      // 角色列表
      rolelist: [],
      // 总共用户个数
      totalpage: 0,
      // 添加用户表单是否显示
      dialogVisible: false,
      // 编辑用户表单是否显示
      editdialogVisible: false,
      // 被选中的表单项
      selectedRoleId: '',
      // 添加用户数据表单
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 编辑用户表单
      editUserForm: {
        username: '',
        email: '',
        mobile: ''
      },
      // 编辑表单规则
      editUserrules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkTel, trigger: 'blur' }
        ]
      },
      // 添加用户规则
      addUserrules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkTel, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 向服务端获取用户列表
    getuserInfo: async function () {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('用户列表请求出错')
      }
      this.userlist = res.data.users
      this.totalpage = res.data.total
    },
    // 每页显示几条--改变的时候,把值赋给data中的数
    handleSizeChange: function (pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getuserInfo()
    },
    // 当前页改变的时候,把值赋给data中的数
    handleCurrentChange: function (current) {
      this.queryInfo.pagenum = current
      this.getuserInfo()
    },
    // 用户状态改变
    changeUserStatus: async function (userInfo) {
      const { data: res } = await this.$http.put(
        'users/' + userInfo.id + '/state/' + userInfo.mg_state + ''
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('用户状态更新失败')
      }
      this.$message.success('用户状态更新成功')
    },
    clearForm: function () {
      this.$refs.addUserruleRef.resetFields()
      this.dialogVisible = false
    },
    addUser: function () {
      this.$refs.addUserruleRef.validate(async (isvalidate) => {
        if (!isvalidate) return false
        // 表单提交
        const { data: res } = await this.$http.post('users', this.addUserForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.dialogVisible = false
        this.$message.success('添加用户成功')
        this.getuserInfo()
      })
    },
    editUser: async function (id) {
      this.editdialogVisible = true
      const { data: res } = await this.$http.get('users/' + id)
      this.editUserForm = res.data
    },
    closeEditForm: function () {
      this.$refs.editUserruleRef.resetFields()
    },
    editUserInfo: function () {
      this.$refs.editUserruleRef.validate(async (isvalidate) => {
        if (!isvalidate) return false
        // 进行用户信息更新
        const { data: res } = await this.$http.put(
          'users/' + this.editUserForm.id,
          {
            email: this.editUserForm.email,
            mobile: this.editUserForm.mobile
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('用户信息修改失败')
        }
        // 关闭表单
        this.editdialogVisible = false
        // 刷新数据
        this.getuserInfo()
        this.$message.success('用户信息修改成功')
      })
    },
    async deleteUser(id) {
      const isdelete = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (isdelete !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getuserInfo()
    },
    // 获取用户角色列表
    async allotRoles(role) {
      this.roleUserInfo = role
      // 展示对话框之前，获取角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('角色列表获取失败')
      }
      this.rolelist = res.data
      this.allotRolesdialogVisible = true
    },
    // 分配用户角色
    async savaUserRole() {
      if (!this.selectedRoleId) return this.$message.error('请选择分配的角色')
      const { data: res } = await this.$http.put(
        `users/${this.roleUserInfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      )
      if (res.meta.status !== 200) return this.$message.error('分配角色失败')
      this.$message.success('分配角色成功')
      this.selectedRoleId = ''
      this.getuserInfo()
      this.allotRolesdialogVisible = false
    },
    // 监听分配角色对话框关闭
    clearSelectedInfo() {
      this.selectedRoleId = ''
    }
  },
  created() {
    this.getuserInfo()
  }
}
</script>

<style lang="less" scoped>
.margintb {
  margin: 30px 0;
}
</style>
