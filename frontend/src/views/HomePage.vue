<template>
	<div class="home">
		<h1>Welcome to Public Chat</h1>
		<div class="login-form">
			<h2>Login</h2>
			<input v-model="username" placeholder="Enter your username" />
			<input v-model="password" type="password" placeholder="Enter your password" />
			<button :disabled="!isLoginFormValid" @click="login">Join Chat</button>
		</div>
		<div class="register-form">
			<h2>Register</h2>
			<input v-model="newUsername" placeholder="Enter new username" />
			<input v-model="newPassword" type="password" placeholder="Enter new password" />
			<button :disabled="!isRegisterFormValid" @click="register">Register</button>
		</div>
	</div>
</template>
  
<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default defineComponent({
	name: 'HomePage',
	setup() {
		const router = useRouter()
		const store = useStore()

		const username = ref('')
		const password = ref('')
		const newUsername = ref('')
		const newPassword = ref('')

		// Load username from localStorage if available
		onMounted(() => {
			const storedUsername = localStorage.getItem('username')
			if (storedUsername) {
				username.value = storedUsername
			}
		})

		// Computed property to check if the login form is valid
		const isLoginFormValid = computed(() => {
			return username.value.trim().length >= 3 && password.value.trim().length >= 3
		})

		// Computed property to check if the register form is valid
		const isRegisterFormValid = computed(() => {
			return newUsername.value.trim().length >= 3 && newPassword.value.trim().length >= 3
		})

		const login = () => {
			if (isLoginFormValid.value) {
				const user = store.state.users.find(
					(u: any) => u.username === username.value && u.password === password.value
				)
				if (user) {
					// Save username to localStorage
					localStorage.setItem('username', username.value)
					store.commit('setCurrentUser', user)
					router.push({ name: 'ChatPage', query: { username: username.value } })
				} else {
					alert('Invalid username or password')
				}
			}
		}

		const register = () => {
			if (isRegisterFormValid.value) {
				try {
					store.dispatch('registerUser', { username: newUsername.value, password: newPassword.value })
					alert('User registered successfully')
					newUsername.value = ''
					newPassword.value = ''
				} catch (error) {
					alert('User already exists')
				}
			}
		}

		return {
			username,
			password,
			newUsername,
			newPassword,
			isLoginFormValid,
			isRegisterFormValid,
			login,
			register
		}
	}
})
</script>
  
<style scoped>
/* Add some basic styling */
button:disabled {
	background-color: #ccc;
	cursor: not-allowed;
}

.login-form,
.register-form {
	margin-bottom: 20px;
}
</style>
  