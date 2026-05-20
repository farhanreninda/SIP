Vue.component('login-page', {
  props: {
    showCustomerLink: {
      type: Boolean,
      default: true
    },
    initialFeedback: {
      type: Object,
      default: () => ({ message: '', type: 'info' })
    }
  },
  template: `
    <v-container fluid class="auth-screen">
      <div class="auth-panel animate-up" :class="{'is-shaking': shake}">
        <div class="auth-heading">
          <div class="brand-mark auth-brand-mark">
            <v-icon color="white">mdi-noodles</v-icon>
          </div>
          <h1>Selamat datang <v-icon color="#c2372f">mdi-hand-wave-outline</v-icon></h1>
          <p>Masuk untuk mulai mengelola warung Anda hari ini.</p>
        </div>

        <v-progress-linear v-if="loading" indeterminate color="#c2372f" height="3" class="mb-4"></v-progress-linear>

        <v-form ref="form" class="auth-form" @submit.prevent="login" @keydown.enter.native.prevent="login" @keyup.enter.native.prevent="login">
          <label class="auth-label">Username</label>
          <v-text-field
            v-model="username"
            outlined
            hide-details="auto"
            prepend-inner-icon="mdi-account"
            class="auth-input mb-5"
            placeholder="admin"
            @keydown.enter.native.prevent="login"
            @keyup.enter.native.prevent="login"
          ></v-text-field>

          <label class="auth-label">Password</label>
          <v-text-field
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            :append-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            @click:append="showPassword = !showPassword"
            prepend-inner-icon="mdi-lock"
            outlined
            hide-details="auto"
            class="auth-input mb-3"
            @keydown.native="handleKeyEvent"
            @keydown.enter.native.prevent="login"
            @keyup.enter.native.prevent="login"
            @keyup.native="handleKeyEvent"
          ></v-text-field>

          <div v-if="capsLock" class="mb-2 text-right">
            <v-chip small color="warning" text-color="white">Caps Lock aktif</v-chip>
          </div>

          <div class="auth-options">
            <v-checkbox v-model="remember" label="Ingat saya" hide-details class="auth-check mt-0 pt-0"></v-checkbox>
            <a href="#" @click.prevent="forgot">Lupa password?</a>
          </div>

          <v-btn :loading="loading" class="btn-primary auth-submit" block x-large type="submit">
            Masuk ke Dashboard
            <v-icon right small>mdi-arrow-right</v-icon>
          </v-btn>
          <inline-feedback :message="feedback.message" :type="feedback.type"></inline-feedback>

          <v-btn v-if="showCustomerLink" text block class="mt-4 text-none font-weight-bold" color="#c2372f" @click="$emit('customer-start')">
            <v-icon left small>mdi-qrcode-scan</v-icon>
            Scan Barcode Menu Pelanggan
          </v-btn>
        </v-form>

        <div class="auth-footnote">
          Hanya untuk pegawai warung. Hubungi pemilik untuk akses baru.
        </div>
      </div>
    </v-container>
  `,
  data() {
    return {
      username: localStorage.getItem('savedUsername') || '',
      password: localStorage.getItem('savedPassword') || '',
      feedback: Object.assign({ message: '', type: 'info' }, this.initialFeedback || {}),
      remember: !!localStorage.getItem('savedUsername'),
      showPassword: false,
      loading: false,
      capsLock: false,
      shake: false
    }
  },
  watch: {
    initialFeedback: {
      deep: true,
      handler(value) {
        this.feedback = Object.assign({ message: '', type: 'info' }, value || {})
      }
    }
  },
  methods: {
    showFeedback(message, type='info') {
      this.feedback = { message, type }
    },
    forgot() { this.showFeedback('Fitur lupa password belum tersedia', 'info') },
    handleKeyEvent(e) {
      try { this.capsLock = e.getModifierState && e.getModifierState('CapsLock') } catch (err) { }
    },
    triggerShake() {
      this.shake = true
      setTimeout(() => { this.shake = false }, 600)
    },
    login() {
      if (this.loading) return
      this.showFeedback('', 'info')
      if (!this.username || !this.password) {
        this.showFeedback('Isi username dan password', 'error')
        this.triggerShake()
        return
      }

      this.loading = true
      Api.login({ username: this.username, password: this.password })
        .then(res => {
          this.loading = false
          if (res && res.success) {
            localStorage.setItem('currentUser', JSON.stringify(res.user))
            if (this.remember) {
              localStorage.setItem('savedUsername', this.username)
              localStorage.setItem('savedPassword', this.password)
            } else {
              localStorage.removeItem('savedUsername')
              localStorage.removeItem('savedPassword')
            }
            this.showFeedback('Login berhasil', 'success')
            setTimeout(() => { this.$emit('login-success', res.user) }, 350)
          } else {
            this.showFeedback('Login gagal: periksa username/password', 'error')
            this.triggerShake()
          }
        }).catch(err => {
          this.loading = false
          console.error(err)
          this.showFeedback('Terjadi kesalahan koneksi', 'error')
          this.triggerShake()
        })
    }
  }
})
