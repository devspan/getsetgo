<template>
  <div class="login-page">
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <v-icon
          icon="mdi-shield-lock"
          size="48"
          class="loading-icon"
          :color="localConfig.theme.colors.primary"
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

    <div class="login-content">
      <!-- Logo/Brand Section -->
      <div class="brand-section">
        <v-icon
          icon="mdi-shield-lock" 
          size="64" 
          class="brand-icon"
          :color="localConfig.theme.colors.primary"
        />
        <h1 class="brand-title">{{ localConfig.title }}</h1>
        <p class="brand-subtitle">Admin Portal</p>
      </div>

      <!-- Login Form -->
      <v-card
        class="login-card"
        :theme="theme"
        elevation="0"
      >
        <v-card-text class="login-form">
          <v-form
            ref="form"
            v-model="isValid"
            fast-fail
            @submit.prevent="login"
          >
            <div class="input-group">
              <label class="input-label">Username</label>
              <v-text-field
                v-model="user"
                placeholder="Enter your username"
                :rules="[v => !!v || 'Username is required']"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                color="primary"
                density="comfortable"
                bg-color="rgba(0, 0, 0, 0.2)"
                autocomplete="username"
                hide-details
              />
            </div>

            <div class="input-group">
              <label class="input-label">Password</label>
              <v-text-field
                v-model="pass"
                placeholder="Enter your password"
                :rules="[v => !!v || 'Password is required']"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                variant="outlined"
                color="primary"
                density="comfortable"
                bg-color="rgba(0, 0, 0, 0.2)"
                autocomplete="current-password"
                :type="showPassword ? 'text' : 'password'"
                @click:append-inner="showPassword = !showPassword"
                hide-details
              />
            </div>

            <div class="input-group">
              <label class="input-label">2FA Code</label>
              <v-text-field
                v-model="code"
                placeholder="Enter 2FA code"
                :rules="[v => !!v || '2FA Code is required']"
                prepend-inner-icon="mdi-shield-key"
                variant="outlined"
                color="primary"
                density="comfortable"
                bg-color="rgba(0, 0, 0, 0.2)"
                maxlength="6"
                autocomplete="one-time-code"
                hide-details
              />
            </div>

            <v-btn
              block
              color="primary"
              size="large"
              height="48"
              :loading="isLoading"
              :disabled="!isValid || isLoading"
              @click="login"
              class="sign-in-btn"
            >
              Sign In
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </div>

    <!-- Alert -->
    <v-snackbar
      v-model="alert"
      :color="alertType"
      location="bottom right"
      timeout="3000"
    >
      {{ alertText }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import localConfig from "@/local_config"
import { useRouter } from 'vue-router'
import { findErrMessage } from "@/plugins/helpers"

const apiKey = localConfig.api
const user = ref("")
const pass = ref("")
const code = ref("")
const alert = ref(false)
const alertText = ref('')
const alertType = ref('error')
const router = useRouter()
const isLoading = ref(false)
const isValid = ref(false)
const showPassword = ref(false)
const form = ref(null)
const theme = ref('dark')

const login = async () => {
  if (!isValid.value || isLoading.value) return;
  
  isLoading.value = true;
  try {
    const response = await axios.post(`${apiKey}login/`, {
      username: user.value,
      password: pass.value,
      otp_token: code.value
    });    
    localStorage.setItem("jwt_token", response.data.access_token)
    alertType.value = 'success'
    showAlert('Login successful, redirecting...')
    setTimeout(() => {
      router.push({path: '/page/dashboard'})
    }, 1000)
  } catch (error) {
    alertType.value = 'error'
    showAlert(error)
  } finally {
    isLoading.value = false
  }
}

const showAlert = (err) => {
  const alertMessage = findErrMessage(err)
  if(alertMessage) {
    alert.value = true
    alertText.value = alertMessage
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  min-width: 100vw;
  display: grid;
  grid-template-columns: 1fr minmax(360px, 400px) 1fr;
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
}

.login-content {
  grid-column: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
  height: 100vh;
}

.brand-section {
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.brand-icon {
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.2));
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.brand-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-top: 0.5rem;
  font-weight: 400;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.login-card {
  background: transparent !important;
}

.login-form {
  padding: 0;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-label {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  margin-left: 0.25rem;
}

:deep(.v-field) {
  border-radius: 8px;
  --v-field-border-opacity: 0.15;
  background: rgba(0, 0, 0, 0.2) !important;
}

:deep(.v-field__input) {
  padding: 8px 12px;
  font-size: 0.9375rem;
  min-height: 44px !important;
}

:deep(.v-field__prepend-inner) {
  opacity: 0.7;
}

:deep(.v-text-field .v-input__control) {
  min-height: 44px !important;
}

:deep(.v-field__outline) {
  --v-field-border-opacity: 0.15 !important;
  color: rgba(255, 255, 255, 0.3) !important;
}

:deep(.v-field--variant-outlined .v-field__outline) {
  opacity: 0.15;
}

.sign-in-btn {
  margin-top: 2rem;
  text-transform: none;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0;
  height: 48px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.sign-in-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Dark mode input styles */
:deep(.v-field.v-field--variant-outlined) {
  --v-field-border-opacity: 0.15;
}

:deep(.v-field--focused .v-field__outline) {
  opacity: 0.5 !important;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .login-page {
    grid-template-columns: 1rem 1fr 1rem;
  }
  
  .login-content {
    padding: 1rem;
  }
  
  .brand-title {
    font-size: 2rem;
  }
  
  .brand-subtitle {
    font-size: 1rem;
  }
}

/* Ensure proper height on mobile browsers */
@supports (-webkit-touch-callout: none) {
  .login-page {
    min-height: -webkit-fill-available;
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 35, 126, 0.98);
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
  color: white;
}

.loading-text h3 {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0;
  opacity: 0.9;
}

.loading-text p {
  font-size: 0.875rem;
  margin: 0.5rem 0 0;
  opacity: 0.7;
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
  stroke: var(--v-theme-primary);
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