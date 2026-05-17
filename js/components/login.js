Vue.component('login-page', {
  template: `
    <v-container fluid class="login-wrapper">
      <div class="login-card-blue animate-up">
        <div class="text-center mb-6">
          <div class="d-inline-flex align-center justify-center mb-4" style="background: white; color: #2563eb; width: 64px; height: 64px; border-radius: 50%; font-weight: bold; font-size: 20px; border: 2px dashed #2563eb;">
            SIP
          </div>
          <h1 class="animate-up delay-1" style="color: #1e3a8a; font-size: 24px; font-weight: 800; margin-bottom: 8px;">Sistem Informasi Penjualan</h1>
          <p class="animate-up delay-2" style="color: #64748b; font-size: 14px;">Masuk untuk melanjutkan ke aplikasi</p>
        </div>

        <v-progress-linear v-if="loading" indeterminate color="#2563eb" height="3" class="mb-4"></v-progress-linear>

        <v-form ref="form" @submit.prevent="login">
          <div class="mb-4">
            <label style="display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase;">Email / Username</label>
            <v-text-field 
              v-model="username" 
              outlined 
              dense 
              hide-details="auto"
              prepend-inner-icon="mdi-account-outline"
            ></v-text-field>
          </div>

          <div class="mb-2">
            <label style="display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase;">Kata Sandi</label>
            <v-text-field
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append="showPassword = !showPassword"
              prepend-inner-icon="mdi-lock-outline"
              outlined 
              dense 
              hide-details="auto"
              @keydown.native="handleKeyEvent"
              @keyup.native="handleKeyEvent"
            ></v-text-field>
          </div>

          <div v-if="capsLock" class="mb-2 text-right"><v-chip small color="warning" text-color="white">Caps Lock aktif</v-chip></div>

          <div class="d-flex justify-space-between align-center mb-8 mt-2">
            <v-checkbox v-model="remember" label="Ingat saya" hide-details class="mt-0 pt-0"></v-checkbox>
            <a href="#" @click.prevent="forgot" style="color: #2563eb; font-weight: 600; text-decoration: none; font-size: 14px;">Lupa kata sandi?</a>
          </div>

          <v-alert v-if="error" type="error" dense text class="mb-4">{{error}}</v-alert>

          <v-btn :loading="loading" class="btn-primary" block large @click="login">MASUK SEKARANG</v-btn>
        </v-form>

        <div class="text-center mt-6 text-muted" style="font-size: 14px;">
          Belum punya akun? <a href="#" style="color: #2563eb; font-weight: 600; text-decoration: none;">Hubungi Admin</a>
        </div>
      </div>
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
    forgot() { notify('Fitur lupa password belum tersedia', 'info') },
    handleKeyEvent(e) { try { this.capsLock = e.getModifierState && e.getModifierState('CapsLock') } catch (e) { } },
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
      if (!this.username || !this.password) { this.error = 'Isi username dan password'; notify('Isi username dan password', 'error'); this.triggerShake(); return; }
      this.loading = true;
      Api.login({ username: this.username, password: this.password })
        .then(res => {
          this.loading = false;
          if (res && res.success) {
            this.success = true;
            localStorage.setItem('currentUser', JSON.stringify(res.user));
            if (this.remember) localStorage.setItem('savedUsername', this.username);
            else localStorage.removeItem('savedUsername');
            notify('Login berhasil', 'success');
            setTimeout(() => { this.$emit('login-success', res.user) }, 700);
          } else {
            this.error = 'Login gagal: periksa username/password';
            notify('Login gagal: periksa username/password', 'error');
            this.triggerShake();
          }
        }).catch(err => {
          this.loading = false;
          console.error(err);
          this.error = 'Terjadi kesalahan koneksi';
          notify('Terjadi kesalahan koneksi', 'error');
          this.triggerShake();
        });
    }
  }
});
