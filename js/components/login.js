Vue.component('login-page', {
  template: `
    <v-container fluid class="simple-login fill-height d-flex align-center justify-center">
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="12" sm="8" md="4">
          <v-card class="pa-6" elevation="4">
            <div class="brand-row d-flex align-center mb-4">
              <div class="logo">SIP</div>
              <div class="ml-3" style="flex:1">
                <div class="title">Sistem Informasi Penjualan</div>
                <div class="muted">Masuk untuk melanjutkan</div>
              </div>
            </div>

            <v-progress-linear v-if="loading" indeterminate color="primary" height="3"></v-progress-linear>

            <v-form ref="form" class="login-form" @submit.prevent="login">
              <v-text-field v-model="username" label="Email" prepend-inner-icon="mdi-account" outlined dense autocomplete="username" autofocus></v-text-field>

              <v-text-field
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                label="Kata Sandi"
                :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append="showPassword = !showPassword"
                prepend-inner-icon="mdi-lock"
                outlined dense autocomplete="current-password"
                @keydown.native="handleKeyEvent"
                @keyup.native="handleKeyEvent"
              ></v-text-field>

              <div v-if="capsLock" class="mb-2"><v-chip small color="warning" text-color="white">Caps Lock aktif</v-chip></div>

              <v-row align="center">
                <v-col cols="6">
                  <v-checkbox v-model="remember" label="Ingat saya" dense></v-checkbox>
                </v-col>
                <v-col cols="6" class="text-right">
                  <a href="#" @click.prevent="forgot">Lupa kata sandi?</a>
                </v-col>
              </v-row>

              <v-alert v-if="error" type="error" dense text role="alert" aria-live="assertive">{{error}}</v-alert>

              <v-btn :loading="loading" color="primary" class="mt-4 login-submit" block @click="login">MASUK</v-btn>
            </v-form>

            <div class="text-center mt-4 small-text muted">Belum punya akun? Hubungi admin.</div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  `,
  data() {
    return {
      username: localStorage.getItem('savedUsername') || '',
      password: '',
      error: '',
      remember: false,
      showPassword: false,
      loading: false,
      success: false,
      capsLock: false,
      shake: false,
      welcomeText: '',
      _welcomeFull: 'Selamat datang di SIP',
      _welcomeTimer: null
    };
  },
  mounted() {
    this.startWelcomeTyping();
  },
  beforeDestroy() {
    if (this._welcomeTimer) clearInterval(this._welcomeTimer);
  },
  methods: {
  forgot() { notify('Fitur lupa password belum tersedia','info') },
  handleKeyEvent(e) { try { this.capsLock = e.getModifierState && e.getModifierState('CapsLock') } catch(e) {} },
    startWelcomeTyping() {
      const full = this._welcomeFull;
      let i = 0;
      this._welcomeTimer = setInterval(() => {
        if (i <= full.length) {
          this.welcomeText = full.slice(0, i);
          i++;
        } else {
          clearInterval(this._welcomeTimer);
          this._welcomeTimer = null;
        }
      }, 60);
    },
    triggerShake() {
      this.shake = true;
      setTimeout(() => this.shake = false, 600);
    },
    login() {
      this.error = '';
      if (!this.username || !this.password) { this.error = 'Isi username dan password'; notify('Isi username dan password','error'); this.triggerShake(); return; }
      this.loading = true;
      Api.login({ username: this.username, password: this.password })
        .then(res => {
          this.loading = false;
          if (res && res.success) {
            this.success = true;
            localStorage.setItem('currentUser', JSON.stringify(res.user));
            if (this.remember) localStorage.setItem('savedUsername', this.username);
            else localStorage.removeItem('savedUsername');
            notify('Login berhasil','success');
            setTimeout(()=>{ this.$emit('login-success', res.user) }, 700);
          } else {
            this.error = 'Login gagal: periksa username/password';
            notify('Login gagal: periksa username/password','error');
            this.triggerShake();
          }
        }).catch(err => {
          this.loading = false;
          console.error(err);
          this.error = 'Terjadi kesalahan koneksi';
          notify('Terjadi kesalahan koneksi','error');
          this.triggerShake();
        });
    }
  }
});
