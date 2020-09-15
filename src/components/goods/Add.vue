<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert center title="添加商品信息" type="info"></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
      </el-steps>
      <!-- Tab栏 -->
      <!-- el-tab-pane标签只能是el-tabs子节点，因此el-form要包裹在最外层 -->
      <el-form
        label-position="top"
        :model="addForm"
        :rules="addrules"
        ref="addruleFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-tabs
          @tab-click="tabClick"
          :before-leave="beforeTagLeaves"
          v-model="activeIndex"
          :tab-position="'left'"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="CateList"
                :props="props"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="(item) in manyData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="data" v-for="(data,i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="(item) in onlyData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 上传图片时,el-upload发送Ajax不会走全局配置文件,因此没有token,所以要用headers指定请求头数据 -->
            <el-upload
              :action="actionUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers="headerObj"
              list-type="picture"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce" />
            <el-button type="primary" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片对话框 -->
    <el-dialog title="图片预览" :visible.sync="PicdialogVisible" width="50%">
      <img :src="previewUrl" class="img" />
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // 被激活的步骤条
      activeIndex: '0',
      // 添加表单的数据
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: '',
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 分类数据列表
      CateList: [],
      // 级连选择器配置项
      props: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数
      manyData: [],
      // 静态属性
      onlyData: [],
      // 级连选择器被选数据
      selectedvalue: '',
      // 预览图片时的地址
      previewUrl: '',
      // 预览图片对话框
      PicdialogVisible: false,
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 上传图片地址
      actionUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 添加表单的数据规则
      addrules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品分类', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async getCate() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类数据错误')
      }
      this.CateList = res.data
    },
    // 级连选择器改变时的事件
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        this.$message.info('请选择三级分类')
      }
    },
    // 标签切换的时候
    async tabClick() {
      console.log(this.activeIndex)
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'many'
            }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        this.manyData = res.data
        console.log('切换标签时', this.manyData)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'only'
            }
          }
        )
        this.onlyData = res.data
        console.log(this.onlyData)
      }
    },
    // 标签切换之前
    beforeTagLeaves(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择分类')
        return false
      }
    },
    // 上传成功的事件
    handleSuccess(response) {
      // 1.转换为对象
      const picInfo = {
        pic: response.data.tmp_path
      }
      // 2.将其push到pics图片数组中
      this.addForm.pics.push(picInfo)
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file)
      this.PicdialogVisible = true
      this.previewUrl = file.response.data.url
    },
    // 点击移除按钮
    handleRemove(file) {
      // 1.获取被删除文件的路径
      const url = file.response.data.tmp_path
      // 2.将其从数组中移除(1.找到对应索引值再删除)
      const i = this.addForm.pics.findIndex((x) => x.pic === url)
      this.addForm.pics.splice(i, 1)
    },
    // 添加商品
    add() {
      this.$refs.addruleFormRef.validate(async (isvalidate) => {
        console.log(isvalidate)
        if (!isvalidate) {
          return this.$message.error('请填写必要的表单项')
        }
        /**
         * 我们在添加商品时，接口文档指定goods_cat要传递的是
         * 以逗号分隔的字符串，但是我们要是直接转换为字符串的话
         *级联选择器所绑定的参数就会报错，因为它所指定的是数组，
         *因此我们不能直接改变addForm.goods_cat而是采用深拷贝的方法，
         *把对象再复制出来一份，再处理，就可以不改变原来的对象
         */
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        this.manyData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        this.onlyData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // 添加商品
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败')
        this.$message.success('商品添加成功')
        this.$router.push('/goods')
      })
    }
  },
  created() {
    this.getCate()
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length !== 3) {
        return null
      }
      return this.addForm.goods_cat[2]
    }
  }
}
</script>
<style lang="less" scoped>
.img {
  width: 100%;
}
.el-button {
  margin: 20px 0px;
}
</style>
