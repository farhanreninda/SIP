(function(){
  // Simple global confirm dialog using Vuetify. Usage: Confirm.show({title, message, okText, cancelText}).then(ok=>...)
  const ConfirmConstructor = Vue.extend({
    data(){
      return { visible:false, title:'Konfirmasi', message:'', okText:'Ya', cancelText:'Batal', resolver:null }
    },
    methods:{
      open(opts){
        opts = opts || {}
        this.title = opts.title || 'Konfirmasi'
        this.message = opts.message || ''
        this.okText = opts.okText || 'Ya'
        this.cancelText = opts.cancelText || 'Batal'
        this.visible = true
        return new Promise(res=>{ this.resolver = res })
      },
      ok(){ this.visible = false; if(this.resolver){ this.resolver(true); this.resolver=null } },
      cancel(){ this.visible = false; if(this.resolver){ this.resolver(false); this.resolver=null } }
    },
    template: `
      <v-dialog v-model="visible" max-width="520">
        <v-card>
          <v-card-title class="headline">{{title}}</v-card-title>
          <v-card-text style="white-space:pre-line">{{message}}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="grey" @click="cancel">{{cancelText}}</v-btn>
            <v-btn color="primary" @click="ok">{{okText}}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    `
  })

  const instance = new ConfirmConstructor({ vuetify: new Vuetify({}) })
  const el = document.createElement('div')
  document.body.appendChild(el)
  instance.$mount(el)

  window.Confirm = { show: (opts)=> instance.open(opts) }
})()
