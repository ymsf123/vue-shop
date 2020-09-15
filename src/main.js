import Vue from 'vue'
import axios from 'axios'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/global.css'
import TableTree from 'vue-table-with-tree-grid'
// 富文本编辑框
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
// 富文本编辑框挂载
Vue.use(VueQuillEditor)

Vue.component('tree-table', TableTree)
Vue.use(ElementUI)
Vue.prototype.$http = axios
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.config.productionTip = false
axios.interceptors.request.use((config) => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.filter('dateFormat', function (initdate) {
  const dt = new Date(initdate)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const h = (dt.getHours() + '').padStart(2, '0')
  const f = (dt.getMinutes() + '').padStart(2, '0')
  const s = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d}  ${h}:${f}:${s}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
