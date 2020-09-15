<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            clearable
            @clear="getGoods"
            v-model="queryInfo.query"
            placeholder="请输入内容"
            class="input-with-select"
          >
            <el-button @click="getGoods" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="16">
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- table 表格区域 -->
      <el-table border :data="goodsList" stripe style="width: 100%">
        <el-table-column type="index" width="50" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70px"></el-table-column>
        <el-table-column prop="add_time" label="创建事件" width="170px">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="small"></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
              @click="deleteGood(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //   查询出的商品列表
      goodsList: [],
      // 总共的条数
      total: 0
    }
  },
  methods: {
    //   获取商品列表
    async getGoods() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.goodsList = res.data.goods
      this.total = res.data.total
      console.log(this.goodsList)
      console.log(this.total)
    },
    // 每页显示的数量改变时
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getGoods()
    },
    // 页数发生改变时
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getGoods()
    },
    // 删除商品
    async deleteGood(id) {
      const result = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (result !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除失败')
      this.$message.success('删除成功')
      this.getGoods()
    },
    // 添加商品
    addGoods() {
      this.$router.push('/goods/add')
    }
  },
  created() {
    this.getGoods()
  }
}
</script>

<style lang="less" scoped>
</style>
