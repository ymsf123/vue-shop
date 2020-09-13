<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <el-button type="primary" @click="addCate">添加分类</el-button>
      <tree-table
        class="tree-table"
        :show-row-hover="false"
        :expand-type="false"
        border
        :selection-type="false"
        index-text="#"
        :data="goodCateList"
        :columns="columns"
      >
        <!-- 是否有效列 -->
        <template slot-scope="scope" slot="isok">
          <i
            class="el-icon-success"
            style="color:lightgreen"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>
        <!-- 排序列 -->
        <template slot-scope="scope" slot="order">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" @click="editCateInfo(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" @click="deleteCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCatedialogVisible" width="50%">
      <el-form
        :model="addCateruleForm"
        :rules="addCaterules"
        ref="addCateruleFormRef"
        label-width="80px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateruleForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级名称:">
          <!-- options 指定当前数据源 -->
          <!-- props 指定级连选择器的配置项 -->
          <!-- v-model 指定被选择的数据 -->
          <el-cascader
            class="cascader"
            @change="parentCateChanged()"
            clearable
            :props="parentProps"
            v-model="selectedId"
            :options="parentList"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCatedialogVisible" width="30%">
      <el-form
        :model="editCateFormInfo"
        :rules="editCaterules"
        ref="editCateruleFormRefs"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateFormInfo.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类的数据
      goodCateList: [],
      queryInfo: {
        pagenum: 1,
        pagesize: 5
      },
      // 添加分类对话框
      addCatedialogVisible: false,
      // 编辑分类对话框
      editCatedialogVisible: false,
      // 总数居条数
      total: 0,
      // 父级分类列表
      parentList: [],
      // 添加分类信息
      addCateruleForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      // 树形表格中每一列的数据
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          // 表示，将当前定义为模板列
          type: 'template',
          // 使用模板列的名称
          template: 'isok'
        },
        {
          label: '排序',
          prop: 'cat_level',
          // 表示，将当前定义为模板列
          type: 'template',
          // 使用模板列的名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示，将当前定义为模板列
          type: 'template',
          // 使用模板列的名称
          template: 'opt'
        }
      ],
      // 级连选择器的配置项
      parentProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 级连选择器的被选择的数据
      selectedId: '',
      // 编辑分类信息
      editCateFormInfo: {},
      // 分类表单的验证规则对象
      addCaterules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 编辑分类验证规则
      editCaterules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async getCateInfo() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类数据失败')
      }
      this.goodCateList = res.data.result
      this.total = res.data.total
    },
    // 每页显示数据改变时
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateInfo()
    },
    // 当前页数据改变时
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateInfo()
    },
    // 添加分类
    addCate() {
      this.getParentList()
      this.addCatedialogVisible = true
    },
    // 获取父级分类列表
    async getParentList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) return this.$http.error('获取分类失败')
      this.parentList = res.data
    },
    parentCateChanged() {
      if (this.selectedId.length > 0) {
        this.addCateruleForm.cat_pid = this.selectedId[
          this.selectedId.length - 1
        ]
        this.addCateruleForm.cat_level = this.selectedId.length
        return
      }
      this.selectedId.cat_pid = 0
      this.selectedId.cat_level = 0
    },
    // 添加分类
    addCateInfo() {
      this.$refs.addCateruleFormRef.validate(async (isvalidate) => {
        if (!isvalidate) return this.$http.error('请正确填写数据')
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateruleForm
        )
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加权限成功')
        this.getCateInfo()
        this.addCatedialogVisible = false
      })
    },
    // 编辑分类信息
    async editCateInfo(id) {
      this.editCatedialogVisible = true
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类信息失败')
      }
      this.editCateFormInfo = res.data
    },
    // 保存编辑信息
    saveCateInfo() {
      this.$refs.editCateruleFormRefs.validate(async (isvalidate) => {
        console.log(isvalidate)
        if (!isvalidate) return this.$message.error('请正确填写数据')
        const { data: res } = await this.$http.put(
          'categories/' + this.editCateFormInfo.cat_id,
          {
            cat_name: this.editCateFormInfo.cat_name
          }
        )
        if (res.meta.status !== 200) return this.$message.error('更新分类失败')
        this.$message.success('更新分类成功')
        this.editCatedialogVisible = false
        this.getCateInfo()
      })
    },
    // 获取删除信息
    async deleteCate(id) {
      console.log(id)
      const result = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      console.log(result)
      if (result !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('categories/' + id)
      console.log(res)
      if (res.meta.status !== 200) this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getCateInfo()
    }
  },
  created() {
    this.getCateInfo()
  }
}
</script>
<style lang="less" scoped>
.tree-table {
  margin-top: 20px;
}
.cascader {
  width: 100%;
}
</style>
