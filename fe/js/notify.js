(function(){
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
      <v-snackbar v-model="visible" :timeout="timeout" :color="color" top right>
        <div style="white-space:pre-line">{{message}}</div>
        <template v-slot:action>
          <v-btn text @click="close">✕</v-btn>
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
