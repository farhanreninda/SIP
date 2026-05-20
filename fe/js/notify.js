(function(){
  Vue.component('inline-feedback', {
    props: {
      message: { type: String, default: '' },
      type: { type: String, default: 'info' }
    },
    computed: {
      classes(){
        return ['inline-feedback', 'inline-feedback-' + (this.type || 'info')]
      },
      icon(){
        const map = {
          success: 'mdi-check-circle-outline',
          error: 'mdi-alert-circle-outline',
          warning: 'mdi-alert-outline',
          info: 'mdi-information-outline'
        }
        return map[this.type] || map.info
      }
    },
    template: `
      <div v-if="message" :class="classes">
        <v-icon small>{{ icon }}</v-icon>
        <span>{{ message }}</span>
      </div>
    `
  })

  // Vuetify-based global snackbar. Expose window.notify(message, type, timeout)
  const SnackbarConstructor = Vue.extend({
    data(){ return { visible:false, message:'', color:'info', timeout:3000 } },
    methods:{
      open(message, type='info', timeout=3000){
        this.message = message || ''
        this.timeout = timeout || 3000
        if(type === 'success') this.color = 'success'
        else if(type === 'error') this.color = 'error'
        else if(type === 'warning') this.color = 'warning'
        else this.color = 'info'
        // ensure re-open
        this.visible = false
        this.$nextTick(()=>{ this.visible = true })
      },
      close(){ this.visible = false }
    },
    template:`
      <v-snackbar v-model="visible" :timeout="timeout" :color="color" bottom centered class="app-snackbar">
        <div class="app-snackbar-message">{{message}}</div>
        <template v-slot:action>
          <v-btn icon small class="app-snackbar-close" @click="close">
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-snackbar>
    `
  })

  const instance = new SnackbarConstructor({ vuetify: new Vuetify({}) })
  const el = document.createElement('div')
  document.body.appendChild(el)
  instance.$mount(el)

  window.notify = function(message, type='info', timeout=3000){ instance.open(message, type, timeout) }
})()
