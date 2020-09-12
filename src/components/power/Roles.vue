<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <el-button type="primary" @click="addRoledialogVisible = true">添加角色</el-button>
      <div class="text item">
        <el-table :data="rolesList" style="width: 100%" border stripe>
          <el-table-column type="expand" width="100px">
            <template slot-scope="scope">
              <el-row
                :class="['buttomline',i1 === 0?'topline':'','vcenter']"
                v-for="(item1,i1) in scope.row.children"
                :key="item1.id"
              >
                <el-col :span="6">
                  <el-tag closable @close="deleteRight(scope.row,item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="18">
                  <el-row
                    :class="[i2 === 0?'':'topline','vcenter']"
                    v-for="(item2,i2) in item1.children"
                    :key="item2.id"
                  >
                    <el-col :span="6">
                      <el-tag
                        closable
                        type="success"
                        @close="deleteRight(scope.row,item2.id)"
                      >{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag
                        type="warning"
                        closable
                        @close="deleteRight(scope.row,item3.id)"
                        v-for="(item3) in item2.children"
                        :key="item3.id"
                      >{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column type="index" label="#" width="180"></el-table-column>
          <el-table-column prop="roleName" label="角色名称" width="180"></el-table-column>
          <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" @click="editRoles(scope.row.id)">编辑</el-button>
              <el-button type="warning" @click="deleterole(scope.row.id)">删除</el-button>
              <el-button type="danger" @click="setRights(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    <!-- 添加角色表单 -->
    <el-dialog title="添加角色" :visible.sync="addRoledialogVisible" width="50%">
      <!-- 表单区域 -->
      <el-form ref="addRoleformRef" :rules="addRoleRules" :model="addRoleform" label-width="80px">
        <el-form-item label="用户名称" prop="roleName">
          <el-input v-model="addRoleform.roleName"></el-input>
        </el-form-item>
        <el-form-item label="用户描述" prop="roleDesc">
          <el-input v-model="addRoleform.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="clearaddRoleForm">取 消</el-button>
        <el-button type="primary" @click="addRole()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色表单 -->
    <el-dialog
      @close="cleareditRoleForm"
      title="编辑角色"
      :visible.sync="editRoledialogVisible"
      width="30%"
    >
      <!-- 表单区域 -->
      <el-form ref="editRoleformRef" :rules="addRoleRules" :model="editRoleform" label-width="80px">
        <el-form-item label="用户名称" prop="roleName">
          <el-input v-model="editRoleform.roleName"></el-input>
        </el-form-item>
        <el-form-item label="用户描述" prop="roleDesc">
          <el-input v-model="editRoleform.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cleareditRoleForm">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限表单 -->
    <el-dialog @close="clearRights" title="分配权限" :visible.sync="setRightsdialogVisible" width="50%">
      <!-- 树形控件 -->
      <el-tree
        :default-checked-keys="defaultCheckedrole"
        node-key="id"
        show-checkbox
        default-expand-all
        :data="rightList"
        :props="rightsProps"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色数据
      rolesList: [],
      // 权限数据
      rightList: [],
      // 选中的树形节点
      defaultCheckedrole: [],
      // // 三级节点
      // defLeafs: [],
      // 分配权限是否显示
      setRightsdialogVisible: false,
      addRoledialogVisible: false,
      // 编辑角色
      editRoledialogVisible: false,
      // 当前想要分配权限用户的id,分配权限时会用
      roleId: '',
      // 权限树形控件数据
      rightsProps: {
        children: 'children',
        label: 'authName'
      },
      //   添加角色表单
      addRoleform: {
        roleName: '',
        roleDesc: ''
      },
      //   编辑角色的表单信息
      editRoleform: {
        roleName: '',
        roleDesc: ''
      },
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入用户描述', trigger: 'blur' },
          { min: 2, max: 18, message: '长度在 2 到 18 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取角色列表
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('角色请求错误')
      this.rolesList = res.data
    },
    // 清空添加角色表单的数据及验证
    clearaddRoleForm() {
      this.$refs.addRoleformRef.resetFields()
      this.addRoledialogVisible = false
    },
    // 清空编辑角色表单的数据及验证
    cleareditRoleForm() {
      this.$refs.editRoleformRef.resetFields()
      this.editRoledialogVisible = false
    },
    // 添加角色
    addRole() {
      this.$refs.addRoleformRef.validate(async (isvalidate) => {
        if (!isvalidate) return false
        const { data: res } = await this.$http.post('roles', this.addRoleform)
        if (res.meta.status !== 201) return this.$message.error('角色创建失败')
        this.$message.success('用户创建成功')
        this.addRoledialogVisible = false
        this.getRoleList()
      })
    },
    // 删除角色
    async deleterole(id) {
      const isdelete = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (isdelete !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getRoleList()
    },
    // 编辑角色
    async editRoles(id) {
      this.editRoledialogVisible = true
      const { data: res } = await this.$http.get('roles/' + id)
      this.editRoleform = res.data
    },
    // 编辑用户
    editRoleInfo() {
      this.$refs.editRoleformRef.validate(async (isvalidate) => {
        if (!isvalidate) return this.$message.error('数据不符合规则')
        const { data: res } = await this.$http.put(
          'roles/' + this.editRoleform.roleId,
          this.editRoleform
        )
        if (res.meta.status !== 200) return this.$message.error('用户编辑失败')
        this.$message.success('用户编辑成功')
        this.editRoledialogVisible = false
        this.getRoleList()
      })
    },
    // 删除权限
    async deleteRight(role, id) {
      const isdelete = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (isdelete !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${id}`
      )
      if (res.meta.status !== 200) return this.$message.error('删除权限失败')
      this.$message.success('删除成功')
      // 如果删除之后重新获取数据，页面会重新渲染，体验不好
      // this.getRoleList()
      role.children = res.data
    },
    // 获取权限
    async setRights(role) {
      // 当前想要分配权限用户的id,分配权限时会用
      this.roleId = role.id
      this.setRightsdialogVisible = true
      const { data: res } = await this.$http.get('rights/tree')
      this.rightList = res.data
      // 获取三级节点
      this.getLeafKeys(role, this.defaultCheckedrole)
    },
    // 递归三级权限
    getLeafKeys(node, arr) {
      // 如果是三级节点
      if (!node.children) {
        arr.push(node.id)
        return false
      }
      // 如果不是三级节点,就遍历当前节点,直到是三级节点为止
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    // 关闭权限列表时,清空数组
    clearRights() {
      this.defaultCheckedrole = []
    },
    // 分配用户权限
    async allotRights() {
      const seledkeys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      console.log('selected', seledkeys)
      const idstr = seledkeys.join(',')
      const { data: res } = await this.$http.post(
        'roles/' + this.roleId + '/rights',
        { rids: idstr }
      )
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('权限分配失败')
      this.$message.success('权限分配成功')
      this.getRoleList()
      this.setRightsdialogVisible = false
    }
  },
  async created() {
    this.getRoleList()
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.topline {
  border-top: 1px solid #eee;
}
.buttomline {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
