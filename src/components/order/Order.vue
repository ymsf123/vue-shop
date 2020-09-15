<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" class="input-with-select">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表数据 -->
      <el-table :data="orderList" border stripe style="width: 100%">
        <el-table-column type="index" label="#" width="70"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款"></el-table-column>
        <el-table-column prop="is_send" label="是否发货">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status == '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template>
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              @click="addressdialogVisible = true"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location-outline
              el-icon-location-information"
              circle
              @click="GetwuliuData"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
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
    <!-- 编辑地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="addressdialogVisible" width="50%">
      <el-form
        :model="addressruleForm"
        :rules="addressrules"
        ref="addressRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressruleForm.address1"
            :options="CatyData"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressruleForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressdialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流信息 -->
    <el-dialog title="物流信息" :visible.sync="wuliudialogVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in wuliuInfo"
          :key="index"
          :timestamp="activity.time"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import CatyData from './citydata'
export default {
  data() {
    return {
      CatyData: CatyData,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      orderList: [],
      total: 0,
      addressdialogVisible: false,
      wuliudialogVisible: false,
      wuliuInfo: [],
      addressruleForm: {
        address1: [],
        address2: ''
      },
      addressrules: {
        address1: [{ required: true, message: '请输入地址', trigger: 'blur' }],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('订单数据获取失败')
      }
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 每页数据数量改变
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getOrderList()
    },
    // 当前页改变
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getOrderList()
    },
    // 获取物流信息
    async GetwuliuData() {
      this.wuliudialogVisible = true
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('物流消息获取失败')
      }
      this.wuliuInfo = res.data
      console.log(this.wuliuInfo)
    }
  },
  created() {
    this.getOrderList()
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
