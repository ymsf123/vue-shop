<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-alert show-icon :closable="false" title="注意，只允许为三级标签设置参数" type="warning"></el-alert>
      <el-row>
        <el-col>
          <span class="grid-content bg-purple">请选择商品分类：</span>
          <el-cascader
            style="width:300px"
            size="medium"
            @change="selectedChange"
            v-model="selectedGoodsCates"
            :options="goodsCates"
            :props="props"
          ></el-cascader>
        </el-col>
      </el-row>

      <el-tabs v-model="activeName" type="card" @tab-click="TagClick">
        <!-- 动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            :disabled="isBtnDisable"
            @click="addParamsdialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe style="width: 100%">
            <el-table-column type="expand" width="180">
              <template slot-scope="scope">
                <el-tag
                  @close="handleDeleteTag(scope.row,i)"
                  closable
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                >{{item}}</el-tag>
                <!-- 添加标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" width="180"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称" width="180"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            :disabled="isBtnDisable"
            type="primary"
            @click="addParamsdialogVisible = true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe style="width: 100%">
            <el-table-column type="expand" width="180">
              <template slot-scope="scope">
                <el-tag
                  @close="handleDeleteTag(scope.row,i)"
                  closable
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                >{{item}}</el-tag>
                <!-- 添加标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" width="180"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称" width="180"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!-- 添加动态参数与静态属性 -->
      <el-dialog
        @close="clearAddParamsForm"
        :title="'添加'+getTitle"
        :visible.sync="addParamsdialogVisible"
        width="50%"
      >
        <el-form
          :model="addParamsForm"
          :rules="addParamsrules"
          ref="addParamsRef"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item :label="getTitle" prop="attr_name">
            <el-input v-model="addParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addParamsdialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改动态参数与静态属性 -->
      <el-dialog
        @close="clearEditParamsForm"
        :title="'修改'+getTitle"
        :visible.sync="editParamsdialogVisible"
        width="50%"
      >
        <el-form
          :model="editParamsForm"
          :rules="editParamsrules"
          ref="editParamsRef"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item :label="getTitle" prop="attr_name">
            <el-input v-model="editParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editParamsdialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveeditParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类的数据
      goodsCates: [],
      //   级连选择器中被选中的商品分类
      selectedGoodsCates: [],
      //   级联选择器的配置参数
      props: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //   被选中的标签名
      activeName: 'many',
      // 静态属性数据
      onlyTableData: [],
      //   动态参数数据
      manyTableData: [],
      //   添加动态属性或静态参数的对话框显示与隐藏
      addParamsdialogVisible: false,
      //   添加动态参数与静态属性的表单数据
      addParamsForm: {},
      //   修改动态参数与静态属性的表单数据
      editParamsForm: {},
      //   添加动态参数与静态属性的表单验证规则
      addParamsrules: {
        attr_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ]
      },
      //   修改动态参数与静态属性的表单验证规则
      editParamsrules: {
        attr_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ]
      },
      //   修改对话框的显示
      editParamsdialogVisible: false
    }
  },
  methods: {
    async getgoodsCate() {
      const { data: res } = await this.$http.get('categories')
      this.goodsCates = res.data
    },
    // 级联选择器变化时
    async selectedChange() {
      this.getParams()
    },
    // 获取参数数据
    async getParams() {
      // 判断是否选中的是3级分类
      if (this.selectedGoodsCates.length !== 3) {
        this.selectedGoodsCates = []
        this.manyTableData = []
        this.onlyTableData = []
        this.$message.info('请选择3级分类')
        return
      }
      const { data: res } = await this.$http.get(
        'categories/' + this.cateId + '/attributes',
        {
          params: {
            sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框的内容
        item.inputValue = ''
      })
      console.log('赋值之后', res.data)
      if (this.activeName === 'only') {
        this.onlyTableData = res.data
      } else {
        this.manyTableData = res.data
      }
    },
    // 点击标签时
    TagClick() {
      this.getParams()
    },
    //   清除验证规则
    clearAddParamsForm() {
      this.$refs.addParamsRef.resetFields()
    },
    // 添加动态或静态参数
    addParams() {
      this.$refs.addParamsRef.validate(async (isvalidate) => {
        if (!isvalidate) return this.$message.error('请输入正确的数据')
        console.log(this.addParamsForm.attr_name)
        console.log(this.activeName)
        const { data: res } = await this.$http.post(
          'categories/' + this.cateId + '/attributes',
          {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.$message.success('添加成功')
        this.addParamsdialogVisible = false
        this.getParams()
      })
    },
    // 修改对话框
    editParams() {},
    // 清空修改对话框的验证对象
    clearEditParamsForm() {
      this.$refs.editParamsRef.resetFields()
    },
    async showEditDialog(id) {
      console.log(id)
      const { data: res } = await this.$http.get(
        'categories/' + this.cateId + '/attributes/' + id + ''
      )
      if (res.meta.status !== 200) return this.$message.error('获取信息失败')
      this.editParamsForm = res.data
      this.editParamsdialogVisible = true
    },
    // 更新编辑表单
    saveeditParams() {
      this.$refs.editParamsRef.validate(async (isvalidate) => {
        if (!isvalidate) return this.$message.error('请输入正确的数据')
        const { data: res } = await this.$http.put(
          'categories/' +
            this.cateId +
            '/attributes/' +
            this.editParamsForm.attr_id +
            '',
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) return this.$message.error('更新失败')
        this.$message.success('更新成功')
        this.getParams()
        this.editParamsdialogVisible = false
      })
    },
    // 删除动静参数
    async deleteParams(id) {
      const result = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (result !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(
        'categories/' + this.cateId + '/attributes/' + id + ''
      )
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getParams()
    },
    // 输入框失去焦点时的事件
    async handleInputConfirm(row) {
      // 如果内容为空
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 输入值合法
      row.attr_vals.push(row.inputValue.trim())
      const { data: res } = await this.$http.put(
        'categories/' + this.cateId + '/attributes/' + row.attr_id + '',
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(',')
        }
      )
      if (res.meta.status !== 200) return this.$message.error('添加失败')
      this.$message.success('添加成功')
      row.inputValue = ''
      row.inputVisible = false
    },
    // 点击按钮事件
    showInput(row) {
      row.inputVisible = true
      // $nextTick的作用当页面上的元素被重新渲染之后,才会执行回调函数中的代码
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除标签
    async handleDeleteTag(row, i) {
      row.attr_vals.splice(i, 1)
      console.log(row.attr_vals)
      const { data: res } = await this.$http.put(
        'categories/' + this.cateId + '/attributes/' + row.attr_id + '',
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(',')
        }
      )
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
    }
  },
  created() {
    this.getgoodsCate()
  },
  //   计算属性
  computed: {
    //   如果选中的不是三级标签，则按钮禁用
    isBtnDisable() {
      if (this.selectedGoodsCates.length !== 3) return true
      return false
    },
    // 计算选中三级标签的id
    cateId() {
      if (this.selectedGoodsCates.length !== 3) return null
      return this.selectedGoodsCates[2]
    },
    // 判断添加的是动态参数还是静态属性
    getTitle() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-row {
  margin: 20px 0;
}
.el-tag {
  margin: 10px;
}
.el-input {
  width: 150px;
}
</style>
