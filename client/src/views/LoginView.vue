<template>
  <div class="login-container">
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
        // Simula uma requisição de login (substitua pela sua API real)
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
      // Simula uma requisição de API
      return new Promise((resolve) => {
        setTimeout(() => {
          // Aqui você faria a chamada real para sua API
          // const response = await fetch('/api/auth/login', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ email: this.email, password: this.password })
          // })
          
                     // Simulação de autenticação (substitua pela sua lógica real)
           if (this.email === 'admin@zeroloss.com' && this.password === '123456') {
             resolve({
               success: true,
               token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
               user: {
                 id: '1',
                 email: this.email,
                 name: 'Administrador',
                 role: 'admin'
               }
             })
           } else if (this.email === 'user@test.com' && this.password === '123456') {
             resolve({
               success: true,
               token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
               user: {
                 id: '2',
                 email: this.email,
                 name: 'Usuário Teste',
                 role: 'user'
               }
             })
           } else {
             resolve({
               success: false,
               message: 'E-mail ou senha incorretos'
             })
           }
        }, 1500) // Simula delay da rede
      })
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
  background: url('../assets/img/img-auth-bg-dark.png') center center / cover no-repeat;
  padding: 20px;
  position: relative;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(0, 0, 0, 0.4) 100%
  );
  z-index: 1;
}

.login-card {
  background: rgba(42, 42, 42, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
  animation: fadeInUp 0.6s ease-out;
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
  background: #1a1a1a;
  border: 2px solid #404040;
  border-radius: 8px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #00ff88;
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
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
  border-radius: 8px;
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
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #00cc6a 0%, #00ff88 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 255, 136, 0.3);
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
