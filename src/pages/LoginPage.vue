<template>
  <div class="login-page">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <v-icon
          icon="mdi-shield-lock"
          size="48"
          class="loading-icon"
          color="primary"
        />
        <div class="loading-spinner">
          <svg class="circular" viewBox="25 25 50 50">
            <circle
              class="path"
              cx="50"
              cy="50"
              r="20"
              fill="none"
              stroke-width="4"
              stroke-miterlimit="10"
            />
          </svg>
        </div>
        <div class="loading-text">
          <h3>Authenticating</h3>
          <p>Please wait...</p>
        </div>
      </div>
    </div>

    <div class="login-container">
      <!-- Left Section -->
      <div class="login-content">
        <div class="welcome-section">
          <h1>Welcome Back</h1>
          <p>Please sign in to continue to the admin panel</p>
        </div>

        <v-card class="login-card" elevation="0">
          <v-form 
            ref="form"
            v-model="isValid"
            @submit.prevent="login" 
            class="login-form"
          >
            <div class="input-group">
              <v-text-field
                v-model="username"
                :rules="usernameRules"
                label="Username"
                placeholder="Enter your username"
                variant="outlined"
                color="primary"
                bg-color="surface"
                hide-details="auto"
                prepend-inner-icon="mdi-account"
                autocomplete="username"
              />
            </div>

            <div class="input-group">
              <v-text-field
                v-model="password"
                :rules="passwordRules"
                :type="showPassword ? 'text' : 'password'"
                label="Password"
                placeholder="Enter your password"
                variant="outlined"
                color="primary"
                bg-color="surface"
                hide-details="auto"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                autocomplete="current-password"
              />
            </div>

            <div class="input-group">
              <v-text-field
                v-model="otpToken"
                :rules="tfaRules"
                label="2FA Code"
                placeholder="Enter your 2FA code"
                variant="outlined"
                color="primary"
                bg-color="surface"
                hide-details="auto"
                prepend-inner-icon="mdi-shield-key-outline"
                maxlength="6"
                @keypress="onlyNumbers"
                autocomplete="one-time-code"
              />
            </div>

            <div class="flex-row space-between mb-6">
              <v-checkbox
                v-model="rememberMe"
                label="Keep me signed in"
                color="primary"
                hide-details
                density="comfortable"
              />
              <a href="#" class="forgot-link">Forgot password?</a>
            </div>

            <v-btn
              type="submit"
              color="primary"
              size="large"
              block
              :loading="loading"
              :disabled="!isValid || loading"
              class="login-btn"
              elevation="1"
            >
              Sign In
            </v-btn>
          </v-form>
        </v-card>
      </div>

      <!-- Right Section -->
      <div class="login-banner">
        <div class="banner-content">
          <div class="banner-icon">
            <v-icon icon="mdi-shield-lock-outline" size="48" color="white" />
          </div>
          <h2>Secure Admin Portal</h2>
          <p>Access your administrative dashboard with enhanced security and control</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/plugins/axios'
import localConfig from '@/local_config'
import { findErrMessage } from "@/plugins/helpers"

const router = useRouter()
const username = ref('')
const password = ref('')
const otpToken = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const isValid = ref(false)
const form = ref(null)

const usernameRules = [
  v => !!v || 'Username is required'
]

const passwordRules = [
  v => !!v || 'Password is required',
  v => v.length >= 6 || 'Password must be at least 6 characters'
]

const tfaRules = [
  v => !!v || '2FA Code is required',
  v => v.length === 6 || 'Code must be 6 digits'
]

const onlyNumbers = (e) => {
  const char = String.fromCharCode(e.keyCode)
  if (/^[0-9]+$/.test(char)) return true
  e.preventDefault()
}

const login = async () => {
  if (!isValid.value || loading.value) return
  
  loading.value = true
  try {
    const response = await axios.post(`${localConfig.api}login/`, {
      username: username.value,
      password: password.value,
      otp_token: otpToken.value
    })
    
    localStorage.setItem('jwt_token', response.data.access_token)
    window.$showAlert('Login successful, redirecting...', 'success')
    
    setTimeout(() => {
      router.push('/page/dashboard')
    }, 1000)
  } catch (error) {
    window.$showAlert(findErrMessage(error), 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--v-theme-background);
  padding: 2rem;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.4;
    z-index: 0;
    background: 
      linear-gradient(90deg, var(--v-theme-surface) 21px, transparent 1%) center,
      linear-gradient(var(--v-theme-surface) 21px, transparent 1%) center,
      rgba(var(--v-theme-primary), 0.2);
    background-size: 22px 22px;
  }

  &::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.5;
    z-index: 0;
    background: 
      radial-gradient(circle at 100% 50%, transparent 20%, rgba(var(--v-theme-primary), 0.1) 21%, rgba(var(--v-theme-primary), 0.1) 34%, transparent 35%, transparent),
      radial-gradient(circle at 0% 50%, transparent 20%, rgba(var(--v-theme-primary), 0.1) 21%, rgba(var(--v-theme-primary), 0.1) 34%, transparent 35%, transparent) 0 -50px;
    background-size: 75px 100px;
  }
}

.login-container {
  width: 100%;
  max-width: 1000px;
  display: flex;
  background: var(--v-theme-surface);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-surface), 0.9);
}

.login-content {
  flex: 1;
  padding: 3rem;
  max-width: 480px;
}

.welcome-section {
  margin-bottom: 2.5rem;

  h1 {
    font-size: 2rem;
    font-weight: 600;
    color: var(--v-theme-on-surface);
    margin-bottom: 0.5rem;
    letter-spacing: -0.5px;
  }

  p {
    color: var(--v-theme-secondary);
    font-size: 1rem;
    line-height: 1.5;
  }
}

.login-card {
  background: transparent !important;
  padding: 0;
}

.login-form {
  .input-group {
    margin-bottom: 1.5rem;
  }

  :deep(.v-field) {
    border-radius: 12px;
    background: rgba(var(--v-theme-surface), 0.8) !important;
    border: 1px solid rgba(var(--v-border-color), 0.12);
    
    &:hover {
      border-color: rgba(var(--v-theme-primary), 0.5);
    }
    
    &.v-field--focused {
      border-color: rgb(var(--v-theme-primary));
      box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.1);
    }
  }

  :deep(.v-field__input) {
    padding: 16px;
    font-size: 0.9375rem;
    min-height: 52px !important;
  }

  :deep(.v-field__prepend-inner) {
    opacity: 0.7;
    padding-right: 8px;
  }
}

.flex-row {
  display: flex;
  align-items: center;
}

.space-between {
  justify-content: space-between;
}

.forgot-link {
  color: rgb(var(--v-theme-primary));
  font-size: 0.875rem;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
}

.login-btn {
  height: 52px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
  border-radius: 12px;
}

.login-banner {
  flex: 1;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgba(var(--v-theme-primary), 0.8) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3Cg fill='%23ffffff' fill-opacity='0.1' transform='rotate(45)'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    background-size: 30px 30px;
    opacity: 0.2;
  }
}

.banner-content {
  text-align: center;
  color: white;
  position: relative;
  z-index: 1;

  .banner-icon {
    background: rgba(255, 255, 255, 0.1);
    width: 80px;
    height: 80px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
  }

  h2 {
    font-size: 1.75rem;
    font-weight: 600;
    margin-bottom: 1rem;
    letter-spacing: -0.5px;
  }

  p {
    font-size: 1rem;
    opacity: 0.9;
    line-height: 1.6;
    max-width: 320px;
    margin: 0 auto;
  }
}

// Responsive Design
@media (max-width: 900px) {
  .login-banner {
    display: none;
  }

  .login-content {
    max-width: none;
  }
}

@media (max-width: 600px) {
  .login-page {
    padding: 1rem;
  }

  .login-content {
    padding: 2rem;
  }

  .welcome-section h1 {
    font-size: 1.75rem;
  }
}

.input-group {
  transition: all 0.3s ease;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--v-theme-surface), 0.98);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.loading-icon {
  animation: pulse 2s infinite;
}

.loading-text {
  text-align: center;
  color: var(--v-theme-on-surface);
  
  h3 {
    font-size: 1.25rem;
    font-weight: 500;
    margin: 0;
    opacity: 0.9;
  }
  
  p {
    font-size: 0.875rem;
    margin: 0.5rem 0 0;
    opacity: 0.7;
  }
}

.loading-spinner {
  position: relative;
  width: 40px;
  height: 40px;
}

.circular {
  animation: rotate 2s linear infinite;
  height: 100%;
  transform-origin: center center;
  width: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
}

.path {
  stroke: rgb(var(--v-theme-primary));
  stroke-dasharray: 89, 200;
  stroke-dashoffset: 0;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124px;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>