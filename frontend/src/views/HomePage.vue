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
		});

		// Computed property to check if the register form is valid
		const isRegisterFormValid = computed(() => {
			return newUsername.value.trim().length >= 3 && newPassword.value.trim().length >= 3
		});

		const login = async () => {
			if (isLoginFormValid.value) {

				const response = await fetch('http://localhost:3000/signIn', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ username: username.value, password: password.value}),
				});
				var user = {
					username: '',
					password: ''
				};

				if(response.status === 200) {
					user.username = username.value;
					user.password = password.value;
					localStorage.setItem('username', username.value)
					store.commit('setCurrentUser', user)
					router.push({ name: 'ChatPage', query: { username: username.value } })
				} else {
					var responsedata = await response.json();
					alert(responsedata.error);
				}
			}
		}

		const register = async () => {
			if (isRegisterFormValid.value) {
				try {

					const response = await fetch('http://localhost:3000/signUp', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ username: newUsername.value, password: newPassword.value}),
					});
					if(response.status === 200) {
						alert('User registered successfully')
						newUsername.value = ''
						newPassword.value = ''
					} else {
						var responsedata = await response.json();
						alert(responsedata.error);
					}
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
  