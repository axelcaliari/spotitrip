import Vue from 'vue'
import VueRouter from 'vue-router'
import VueCookies from 'vue-cookies'
import routes from './routes'
Vue.use(VueRouter)
Vue.use(VueCookies)

VueCookies.config('7d')

// configure router
const router = new VueRouter({
  routes, // short for routes: routes
  linkActiveClass: 'active',
  mode: 'history'
})

export default router
