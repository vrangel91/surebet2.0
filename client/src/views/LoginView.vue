<template>
  <div class="login-container">
    <!-- Video Background -->
    <video 
      class="video-background" 
      autoplay 
      muted 
      loop 
      playsinline
      ref="videoElement"
      @loadedmetadata="setVideoStartTime"
    >
      <source src="../assets/movie/playvideo.mp4" type="video/mp4">
      Seu navegador não suporta vídeos.
    </video>
    
    <!-- Overlay com gradiente para transparência -->
    <div class="video-overlay"></div>
    
    <!-- Overlay adicional de baixo para cima -->
    <div class="bottom-overlay"></div>
    
    <!-- Partículas flutuantes -->
    <div class="floating-particles">
      <div class="particle" v-for="n in 20" :key="n"></div>
    </div>

    <div class="login-card">
      <!-- Logo e Header -->
      <div class="login-header">
        <div class="logo">
          <img class="logo-icon" src="@/assets/img/logo.png" alt="SureStake Logo" width="40" height="40">
          <h1 class="logo-text">
            <span class="sure-text">SURE</span>
            <span class="stake-text">STAKE</span>
          </h1>
        </div>
        <h2 class="login-title">{{ isLoginMode ? 'Acesse sua conta' : 'Crie sua conta' }}</h2>
      </div>

      <!-- Formulário de Login -->
      <form v-if="isLoginMode" @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <input
            v-model="email"
            type="email"
            placeholder="E-mail"
            class="form-input"
            :class="{ 'error': emailError }"
            required
            @blur="validateEmail"
          />
          <span v-if="emailError" class="error-message">{{ emailError }}</span>
        </div>

        <div class="form-group">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Senha"
            class="form-input"
            :class="{ 'error': passwordError }"
            required
            @blur="validatePassword"
          />
          <button
            type="button"
            class="password-toggle"
            @click="togglePassword"
          >
            <svg v-if="showPassword" class="eye-icon" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
              <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
            </svg>
            <svg v-else class="eye-icon" fill="currentColor" viewBox="0 0 16 16">
              <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-.708-.709C13.327 10.665 14 9.665 14 8.5 14 6.567 12.433 5 10.5 5c-1.165 0-2.165.673-2.79 1.588l.5.5z"/>
              <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 3.172-2.828-2.829a3.5 3.5 0 0 0-4.95-4.95l-2.829-2.828a6.5 6.5 0 0 1 7.778 7.778z"/>
            </svg>
          </button>
          <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input
              v-model="rememberMe"
              type="checkbox"
              class="checkbox"
            />
            <span class="checkbox-label">Lembrar-me</span>
          </label>
          <button type="button" class="forgot-password" @click="forgotPassword">
            Esqueceu sua senha?
          </button>
        </div>

        <div class="button-group">
          <button
            type="submit"
            class="login-btn primary"
            :disabled="isLoading || !isFormValid"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            <span v-else>{{ loginButtonText }}</span>
          </button>
          <button
            type="button"
            class="login-btn secondary"
            @click="toggleMode"
            :disabled="isLoading"
          >
            Criar conta
          </button>
        </div>
      </form>

      <!-- Formulário de Registro -->
      <form v-else @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <input
            v-model="registerForm.name"
            type="text"
            placeholder="Nome completo"
            class="form-input"
            :class="{ 'error': registerForm.nameError }"
            required
            @blur="validateRegisterName"
          />
          <span v-if="registerForm.nameError" class="error-message">{{ registerForm.nameError }}</span>
        </div>

        <div class="form-group">
          <input
            v-model="registerForm.email"
            type="email"
            placeholder="E-mail"
            class="form-input"
            :class="{ 'error': registerForm.emailError }"
            required
            @blur="validateRegisterEmail"
          />
          <span v-if="registerForm.emailError" class="error-message">{{ registerForm.emailError }}</span>
        </div>

        <div class="form-group">
          <input
            v-model="registerForm.password"
            :type="showRegisterPassword ? 'text' : 'password'"
            placeholder="Senha"
            class="form-input"
            :class="{ 'error': registerForm.passwordError }"
            required
            @blur="validateRegisterPassword"
          />
          <button
            type="button"
            class="password-toggle"
            @click="toggleRegisterPassword"
          >
            <svg v-if="showRegisterPassword" class="eye-icon" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
              <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
            </svg>
            <svg v-else class="eye-icon" fill="currentColor" viewBox="0 0 16 16">
              <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-.708-.709C13.327 10.665 14 9.665 14 8.5 14 6.567 12.433 5 10.5 5c-1.165 0-2.165.673-2.79 1.588l.5.5z"/>
              <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 3.172-2.828-2.829a3.5 3.5 0 0 0-4.95-4.95l-2.829-2.828a6.5 6.5 0 0 1 7.778 7.778z"/>
            </svg>
          </button>
          <span v-if="registerForm.passwordError" class="error-message">{{ registerForm.passwordError }}</span>
        </div>

        <div class="form-group">
          <input
            v-model="registerForm.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Confirmar senha"
            class="form-input"
            :class="{ 'error': registerForm.confirmPasswordError }"
            required
            @blur="validateConfirmPassword"
          />
          <button
            type="button"
            class="password-toggle"
            @click="toggleConfirmPassword"
          >
            <svg v-if="showConfirmPassword" class="eye-icon" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
              <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
            </svg>
            <svg v-else class="eye-icon" fill="currentColor" viewBox="0 0 16 16">
              <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-.708-.709C13.327 10.665 14 9.665 14 8.5 14 6.567 12.433 5 10.5 5c-1.165 0-2.165.673-2.79 1.588l.5.5z"/>
              <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 3.172-2.828-2.829a3.5 3.5 0 0 0-4.95-4.95l-2.829-2.828a6.5 6.5 0 0 1 7.778 7.778z"/>
            </svg>
          </button>
          <span v-if="registerForm.confirmPasswordError" class="error-message">{{ registerForm.confirmPasswordError }}</span>
        </div>

        <!-- Informação sobre o tipo de conta -->
        <div class="account-type-info">
          <div class="account-type-badge">
            <span class="badge-icon">⭐</span>
            <span class="badge-text">Conta BÁSICA</span>
          </div>
          <p class="account-type-description">
            Sua conta será criada com nível BÁSICO por padrão. Você pode fazer upgrade posteriormente.
          </p>
        </div>

                 <div class="button-group">
           <button
             type="submit"
             class="register-btn primary"
             :disabled="isLoading || !isRegisterFormValid"
           >
             <span v-if="isLoading" class="loading-spinner"></span>
             <span v-else>Criar conta</span>
           </button>
           <button
             type="button"
             class="register-btn secondary"
             @click="toggleMode"
             :disabled="isLoading"
           >
             Voltar ao login
           </button>
         </div>
      </form>

      <!-- Mensagens de Erro/Sucesso -->
      <div v-if="loginError" class="alert alert-error">
        {{ loginError }}
      </div>

      <div v-if="registerError" class="alert alert-error">
        {{ registerError }}
      </div>
      <div v-if="registerSuccess" class="alert alert-success">
        {{ registerSuccess }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      rememberMe: true,
      showPassword: false,
      isLoading: false,
      emailError: '',
      passwordError: '',
      loginError: '',

      loginAttempts: 0,
      maxLoginAttempts: 5,
      lockoutTime: 15 * 60 * 1000, // 15 minutos
      lockoutUntil: null,
      isLoginMode: true, // Adicionado para controlar o modo de login/registro
      registerForm: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        nameError: '',
        emailError: '',
        passwordError: '',
        confirmPasswordError: ''
      },
      showRegisterPassword: false,
      showConfirmPassword: false,
      registerError: '',
      registerSuccess: '',
      refererId: null // Para armazenar o ID do referenciador
    }
  },
  computed: {
    isFormValid() {
      return this.email && this.password && !this.emailError && !this.passwordError
    },
    loginButtonText() {
      if (this.isLockedOut) {
        const remainingTime = Math.ceil((this.lockoutUntil - Date.now()) / 1000 / 60)
        return `Tentativas bloqueadas (${remainingTime}min)`
      }
      return 'Entrar'
    },
    isLockedOut() {
      return this.lockoutUntil && Date.now() < this.lockoutUntil
    },
    isRegisterFormValid() {
      return this.registerForm.name && this.registerForm.email && this.registerForm.password && this.registerForm.confirmPassword &&
             !this.registerForm.nameError && !this.registerForm.emailError && !this.registerForm.passwordError && !this.registerForm.confirmPasswordError
    }
  },
  mounted() {
    // Verifica se há dados salvos do "lembrar-me"
    this.checkRememberedUser()
    
    // Verifica se há bloqueio ativo
    this.checkLockout()
    
    // Captura o referer_id da URL se existir
    this.captureRefererId()
  },
  methods: {
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!this.email) {
        this.emailError = 'E-mail é obrigatório'
      } else if (!emailRegex.test(this.email)) {
        this.emailError = 'E-mail inválido'
      } else {
        this.emailError = ''
      }
    },
    
    validatePassword() {
      if (!this.password) {
        this.passwordError = 'Senha é obrigatória'
      } else if (this.password.length < 6) {
        this.passwordError = 'Senha deve ter pelo menos 6 caracteres'
      } else {
        this.passwordError = ''
      }
    },
    
    togglePassword() {
      this.showPassword = !this.showPassword
    },

    validateRegisterName() {
      if (!this.registerForm.name) {
        this.registerForm.nameError = 'Nome é obrigatório'
      } else if (this.registerForm.name.trim().length < 2) {
        this.registerForm.nameError = 'Nome deve ter pelo menos 2 caracteres'
      } else {
        this.registerForm.nameError = ''
      }
    },

    validateRegisterEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!this.registerForm.email) {
        this.registerForm.emailError = 'E-mail é obrigatório'
      } else if (!emailRegex.test(this.registerForm.email)) {
        this.registerForm.emailError = 'E-mail inválido'
      } else if (this.email && this.registerForm.email.toLowerCase() === this.email.toLowerCase()) {
        this.registerForm.emailError = 'Use um e-mail diferente do campo de login'
      } else {
        this.registerForm.emailError = ''
      }
    },

    validateRegisterPassword() {
      if (!this.registerForm.password) {
        this.registerForm.passwordError = 'Senha é obrigatória'
      } else if (this.registerForm.password.length < 6) {
        this.registerForm.passwordError = 'Senha deve ter pelo menos 6 caracteres'
      } else {
        this.registerForm.passwordError = ''
        // Revalidar confirmação de senha se ambas estiverem preenchidas
        if (this.registerForm.confirmPassword) {
          this.validateConfirmPassword()
        }
      }
    },

    toggleRegisterPassword() {
      this.showRegisterPassword = !this.showRegisterPassword
    },

    validateConfirmPassword() {
      if (!this.registerForm.confirmPassword) {
        this.registerForm.confirmPasswordError = 'Confirmação de senha é obrigatória'
      } else if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.registerForm.confirmPasswordError = 'Senhas não conferem'
      } else {
        this.registerForm.confirmPasswordError = ''
      }
    },

    toggleConfirmPassword() {
      this.showConfirmPassword = !this.showConfirmPassword
    },

    async handleLogin() {
      if (this.isLockedOut) {
        return
      }
      
      this.validateEmail()
      this.validatePassword()
      
      if (!this.isFormValid) {
        return
      }
      
      this.isLoading = true
      this.loginError = ''

      
      try {
        const response = await this.authenticateUser()
        
        if (response.success) {

          
          // Salva o token e dados do usuário
          this.$store.dispatch('login', {
            token: response.token,
            user: response.user
          })
          
          // Atualiza o último login
          this.$store.dispatch('updateLastLogin', this.email)
          
          // Salva dados do usuário se "lembrar-me" estiver marcado
          if (this.rememberMe) {
            this.saveRememberedUser()
          }
        
                     // Redireciona baseado no tipo de conta após 1 segundo
           setTimeout(() => {
             // Verifica se o usuário é VIP/Premium ou Básico
             if (response.user.accountType === 'basic') {
               // Usuário básico vai para página de planos
               this.$router.push('/plans')
             } else {
               // Usuário VIP/Premium vai para dashboard
               this.$router.push('/')
             }
           }, 1500)
        } else {
          this.handleLoginFailure(response.message)
        }
      } catch (error) {
        this.handleLoginFailure('Erro de conexão. Tente novamente.')
      } finally {
        this.isLoading = false
      }
    },

    async authenticateUser() {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, password: this.password })
        })
        
        const data = await response.json()
        
        if (response.ok && data.success) {
          return {
            success: true,
            token: data.token,
            user: data.user
          }
        } else {
          return {
            success: false,
            message: data.message || 'E-mail ou senha incorretos'
          }
        }
      } catch (error) {
        console.error('Erro na autenticação:', error)
        return {
          success: false,
          message: 'Erro de conexão. Tente novamente.'
        }
      }
    },

    async handleRegister() {
      this.validateRegisterName()
      this.validateRegisterEmail()
      this.validateRegisterPassword()
      this.validateConfirmPassword()

      if (!this.isRegisterFormValid) {
        return
      }

      this.isLoading = true
      this.registerError = ''
      this.registerSuccess = ''

      try {
        const response = await this.registerUser()

        if (response.success) {
          this.registerSuccess = 'Conta criada com sucesso! Você será redirecionado para o login.'
          this.isLoginMode = true // Volta para o modo de login após o registro
          this.resetRegisterForm()
        } else {
          this.registerError = response.message || 'Erro ao criar conta. Tente novamente.'
        }
      } catch (error) {
        this.registerError = 'Erro de conexão. Tente novamente.'
      } finally {
        this.isLoading = false
      }
    },

    async registerUser() {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: this.registerForm.name,
            email: this.registerForm.email,
            password: this.registerForm.password,
            referer_id: this.refererId // Inclui o ID do referenciador se existir
          })
        })

        const data = await response.json()

        if (response.ok && data.success) {
          return { success: true }
        } else {
          return { success: false, message: data.message || 'Erro ao criar conta.' }
        }
      } catch (error) {
        console.error('Erro no registro:', error)
        return { success: false, message: 'Erro de conexão. Tente novamente.' }
      }
    },

    handleLoginFailure(message) {
      this.loginError = message
      this.loginAttempts++
      
      if (this.loginAttempts >= this.maxLoginAttempts) {
        this.lockoutUntil = Date.now() + this.lockoutTime
        localStorage.setItem('loginLockout', this.lockoutUntil.toString())
        this.loginError = `Muitas tentativas. Tente novamente em 15 minutos.`
      }
    },
    
    saveRememberedUser() {
      const userData = {
        email: this.email,
        rememberMe: true,
        timestamp: Date.now()
      }
      localStorage.setItem('rememberedUser', JSON.stringify(userData))
    },
    
    checkRememberedUser() {
      const remembered = localStorage.getItem('rememberedUser')
      if (remembered) {
        try {
          const userData = JSON.parse(remembered)
          const oneWeek = 7 * 24 * 60 * 60 * 1000
          
          if (userData.rememberMe && (Date.now() - userData.timestamp) < oneWeek) {
            this.email = userData.email
            this.rememberMe = true
          }
        } catch (error) {
          localStorage.removeItem('rememberedUser')
        }
      }
    },
    
    checkLockout() {
      const lockout = localStorage.getItem('loginLockout')
      if (lockout) {
        this.lockoutUntil = parseInt(lockout)
        if (Date.now() >= this.lockoutUntil) {
          localStorage.removeItem('loginLockout')
          this.lockoutUntil = null
          this.loginAttempts = 0
        }
      }
    },

    captureRefererId() {
      // Captura o referer_id da URL se existir
      const urlParams = new URLSearchParams(window.location.search)
      const refererId = urlParams.get('referer_id')
      if (refererId) {
        this.refererId = refererId
        console.log('Referer ID capturado:', refererId)
        // Opcional: mostrar uma mensagem informativa
        this.showRefererInfo()
      }
    },

    showRefererInfo() {
      // Mostra informação sobre o referenciador
      if (this.refererId) {
        this.registerSuccess = `Você foi indicado por um usuário! Seu cadastro será vinculado ao referenciador.`
      }
    },
    
    forgotPassword() {
      // Implementar recuperação de senha
      this.loginError = 'Funcionalidade de recuperação de senha será implementada em breve.'
    },

    toggleMode() {
      this.isLoginMode = !this.isLoginMode
      this.resetRegisterForm() // Limpa o formulário de registro quando muda o modo
    },

    resetRegisterForm() {
      this.registerForm.name = ''
      this.registerForm.email = ''
      this.registerForm.password = ''
      this.registerForm.confirmPassword = ''
      this.registerForm.nameError = ''
      this.registerForm.emailError = ''
      this.registerForm.passwordError = ''
      this.registerForm.confirmPasswordError = ''
      this.showRegisterPassword = false
      this.showConfirmPassword = false
    },
    
    setVideoStartTime() {
      // Define o tempo inicial do vídeo para 6 segundos
      if (this.$refs.videoElement) {
        this.$refs.videoElement.currentTime = 6
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* Video Background */
.video-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  filter: brightness(0.3) contrast(1.2) saturate(0.8);
  animation: videoPulse 8s ease-in-out infinite;
}

@keyframes videoPulse {
  0%, 100% {
    filter: brightness(0.3) contrast(1.2) saturate(0.8);
  }
  50% {
    filter: brightness(0.4) contrast(1.1) saturate(0.9);
  }
}

/* Partículas flutuantes */
.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(0, 255, 136, 0.3);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.particle:nth-child(1) { left: 10%; animation-delay: 0s; animation-duration: 8s; }
.particle:nth-child(2) { left: 20%; animation-delay: 1s; animation-duration: 7s; }
.particle:nth-child(3) { left: 30%; animation-delay: 2s; animation-duration: 9s; }
.particle:nth-child(4) { left: 40%; animation-delay: 3s; animation-duration: 6s; }
.particle:nth-child(5) { left: 50%; animation-delay: 4s; animation-duration: 8s; }
.particle:nth-child(6) { left: 60%; animation-delay: 5s; animation-duration: 7s; }
.particle:nth-child(7) { left: 70%; animation-delay: 6s; animation-duration: 9s; }
.particle:nth-child(8) { left: 80%; animation-delay: 7s; animation-duration: 6s; }
.particle:nth-child(9) { left: 90%; animation-delay: 8s; animation-duration: 8s; }
.particle:nth-child(10) { left: 15%; animation-delay: 9s; animation-duration: 7s; }
.particle:nth-child(11) { left: 25%; animation-delay: 10s; animation-duration: 9s; }
.particle:nth-child(12) { left: 35%; animation-delay: 11s; animation-duration: 6s; }
.particle:nth-child(13) { left: 45%; animation-delay: 12s; animation-duration: 8s; }
.particle:nth-child(14) { left: 55%; animation-delay: 13s; animation-duration: 7s; }
.particle:nth-child(15) { left: 65%; animation-delay: 14s; animation-duration: 9s; }
.particle:nth-child(16) { left: 75%; animation-delay: 15s; animation-duration: 6s; }
.particle:nth-child(17) { left: 85%; animation-delay: 16s; animation-duration: 8s; }
.particle:nth-child(18) { left: 95%; animation-delay: 17s; animation-duration: 7s; }
.particle:nth-child(19) { left: 5%; animation-delay: 18s; animation-duration: 9s; }
.particle:nth-child(20) { left: 45%; animation-delay: 19s; animation-duration: 6s; }

@keyframes float {
  0%, 100% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) scale(1);
    opacity: 0;
  }
}

/* Overlay com gradiente para transparência */
.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0.4) 25%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.4) 75%,
    rgba(0, 0, 0, 0.6) 100%
  );
  z-index: 1;
  animation: overlayShift 12s ease-in-out infinite;
}

@keyframes overlayShift {
  0%, 100% {
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.6) 0%,
      rgba(0, 0, 0, 0.4) 25%,
      rgba(0, 0, 0, 0.3) 50%,
      rgba(0, 0, 0, 0.4) 75%,
      rgba(0, 0, 0, 0.6) 100%
    );
  }
  50% {
    background: linear-gradient(
      225deg,
      rgba(0, 0, 0, 0.5) 0%,
      rgba(0, 0, 0, 0.3) 25%,
      rgba(0, 0, 0, 0.2) 50%,
      rgba(0, 0, 0, 0.3) 75%,
      rgba(0, 0, 0, 0.5) 100%
    );
  }
}

/* Overlay adicional de baixo para cima */
.bottom-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.6) 30%,
    rgba(0, 0, 0, 0.3) 70%,
    rgba(0, 0, 0, 0) 100%
  );
  z-index: 1;
  animation: bottomOverlayPulse 10s ease-in-out infinite;
}

@keyframes bottomOverlayPulse {
  0%, 100% {
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.6) 30%,
      rgba(0, 0, 0, 0.3) 70%,
      rgba(0, 0, 0, 0) 100%
    );
  }
  50% {
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.9) 0%,
      rgba(0, 0, 0, 0.7) 30%,
      rgba(0, 0, 0, 0.4) 70%,
      rgba(0, 0, 0, 0.1) 100%
    );
  }
}

.login-card {
  background: rgba(26, 26, 26, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  position: relative;
  z-index: 2;
  animation: fadeInUp 0.8s ease-out;
  transition: all 0.3s ease;
}

.login-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 30px 60px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(0, 255, 136, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 255, 136, 0.3);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.logo-icon {
  width: 50px;
  height: 50px;
  object-fit: contain;
  border-radius: 6px;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
  animation: logoGlow 2s ease-in-out infinite alternate;
}

@keyframes logoGlow {
  from {
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 10px rgba(0, 255, 136, 0.3));
  }
  to {
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 20px rgba(0, 255, 136, 0.6));
  }
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 1px;
}

.sure-text {
  color: #ffffff;
  font-weight: 700;
}

.stake-text {
  color: #00ff88;
  font-style: italic;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.login-title {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}





.login-form, .register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 16px 20px;
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(64, 64, 64, 0.6);
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  position: relative;
}

.form-input:focus {
  outline: none;
  border-color: #00ff88;
  background: rgba(26, 26, 26, 0.9);
  box-shadow: 
    0 0 0 3px rgba(0, 255, 136, 0.15),
    0 8px 25px rgba(0, 255, 136, 0.1);
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: #808080;
}

.form-input.error {
  border-color: #ff4444;
}

.error-message {
  color: #ff4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #808080;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.password-toggle:hover {
  color: #00ff88;
  background: rgba(0, 255, 136, 0.1);
  transform: translateY(-50%) scale(1.1);
}

.eye-icon {
  width: 18px;
  height: 18px;
  transition: all 0.3s ease;
  animation: iconFade 0.2s ease-in-out;
}

@keyframes iconFade {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox {
  width: 18px;
  height: 18px;
  accent-color: #00ff88;
  cursor: pointer;
}

.checkbox-label {
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
}

.forgot-password {
  background: none;
  border: none;
  color: #00ff88;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #00cc6a;
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
  border: none;
  border-radius: 12px;
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 4px 15px rgba(0, 255, 136, 0.2),
    0 0 0 1px rgba(0, 255, 136, 0.1);
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #00cc6a 0%, #00ff88 100%);
  transform: translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(0, 255, 136, 0.4),
    0 0 0 1px rgba(0, 255, 136, 0.2);
}

.login-btn:hover:not(:disabled)::before {
  left: 100%;
}

.login-btn:disabled {
  background: #404040;
  color: #808080;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.login-btn {
  flex: 1;
}

.login-btn.primary {
  background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
  color: #1a1a1a;
}

.login-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #00cc6a 0%, #00ff88 100%);
}

.login-btn.secondary {
  background: linear-gradient(135deg, #2a2a2a 0%, #404040 100%);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.login-btn.secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #404040 0%, #505050 100%);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.login-btn.secondary::before {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid #1a1a1a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.register-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
  border: none;
  border-radius: 12px;
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 4px 15px rgba(0, 255, 136, 0.2),
    0 0 0 1px rgba(0, 255, 136, 0.1);
}

.register-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.register-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #00cc6a 0%, #00ff88 100%);
  transform: translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(0, 255, 136, 0.4),
    0 0 0 1px rgba(0, 255, 136, 0.2);
}

.register-btn:hover:not(:disabled)::before {
  left: 100%;
}

 .register-btn:disabled {
   background: #404040;
   color: #808080;
   cursor: not-allowed;
   transform: none;
   box-shadow: none;
 }

 .register-btn {
   flex: 1;
 }

 .register-btn.primary {
   background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
   color: #1a1a1a;
 }

 .register-btn.primary:hover:not(:disabled) {
   background: linear-gradient(135deg, #00cc6a 0%, #00ff88 100%);
 }

 .register-btn.secondary {
   background: linear-gradient(135deg, #2a2a2a 0%, #404040 100%);
   color: #ffffff;
   border: 1px solid rgba(255, 255, 255, 0.1);
 }

 .register-btn.secondary:hover:not(:disabled) {
   background: linear-gradient(135deg, #404040 0%, #505050 100%);
   border-color: rgba(255, 255, 255, 0.2);
   transform: translateY(-2px);
   box-shadow: 
     0 8px 25px rgba(0, 0, 0, 0.3),
     0 0 0 1px rgba(255, 255, 255, 0.1);
 }

 .register-btn.secondary::before {
   background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
 }

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 16px;
  font-size: 14px;
  font-weight: 500;
}

.alert-error {
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.3);
  color: #ff4444;
}

.alert-success {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
}

.account-type-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 10px 15px;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 10px;
  color: #00ff88;
  font-size: 14px;
  font-weight: 500;
}

.account-type-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(0, 255, 136, 0.2);
  border: 1px solid rgba(0, 255, 136, 0.4);
  border-radius: 8px;
  padding: 4px 10px;
}

.badge-icon {
  font-size: 18px;
}

.badge-text {
  font-weight: 600;
}

.account-type-description {
  color: #808080;
  font-size: 13px;
  margin-top: 4px;
}

/* Estilos para o formulário de registro */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.register-form .form-group {
  position: relative;
}

.register-form .form-input {
  width: 100%;
  padding: 16px 20px;
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(64, 64, 64, 0.6);
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  position: relative;
}

.register-form .form-input:focus {
  outline: none;
  border-color: #00ff88;
  background: rgba(26, 26, 26, 0.9);
  box-shadow: 
    0 0 0 3px rgba(0, 255, 136, 0.15),
    0 8px 25px rgba(0, 255, 136, 0.1);
  transform: translateY(-1px);
}

.register-form .form-input::placeholder {
  color: #808080;
}

.register-form .form-input.error {
  border-color: #ff4444;
}

/* Animações para transição entre formulários */
.login-form, .register-form {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsividade */
@media (max-width: 480px) {
  .login-card {
    padding: 24px;
    margin: 10px;
  }
  
  .logo-text {
    font-size: 24px;
  }
  
  .login-title {
    font-size: 18px;
  }
  
  .form-options {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
