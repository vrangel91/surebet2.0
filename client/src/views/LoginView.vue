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
          <span class="logo-icon">🦁</span>
          <h1 class="logo-text">
            <span class="zero">SURE</span>
            <span class="loss">STAKE</span>
          </h1>
        </div>
        <h2 class="login-title">Acesse sua conta</h2>
      </div>

      <!-- Formulário de Login -->
      <form @submit.prevent="handleLogin" class="login-form">
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

        <button
          type="submit"
          class="login-btn"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          <span v-else>{{ loginButtonText }}</span>
        </button>
      </form>

      <!-- Mensagens de Erro/Sucesso -->
      <div v-if="loginError" class="alert alert-error">
        {{ loginError }}
      </div>
      <div v-if="loginSuccess" class="alert alert-success">
        {{ loginSuccess }}
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
      loginSuccess: '',
      loginAttempts: 0,
      maxLoginAttempts: 5,
      lockoutTime: 15 * 60 * 1000, // 15 minutos
      lockoutUntil: null
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
    }
  },
  mounted() {
    // Verifica se há dados salvos do "lembrar-me"
    this.checkRememberedUser()
    
    // Verifica se há bloqueio ativo
    this.checkLockout()
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
      this.loginSuccess = ''
      
      try {
        const response = await this.authenticateUser()
        
        if (response.success) {
          this.loginSuccess = 'Login realizado com sucesso!'
          
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
        
          // Redireciona para o dashboard após 1 segundo
          setTimeout(() => {
            this.$router.push('/')
          }, 1000)
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
    
    forgotPassword() {
      // Implementar recuperação de senha
      this.loginError = 'Funcionalidade de recuperação de senha será implementada em breve.'
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
  font-size: 32px;
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

.zero {
  color: #ffffff;
}

.loss {
  color: #00ff88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.login-title {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.login-form {
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
