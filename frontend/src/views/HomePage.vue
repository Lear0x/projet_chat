<template>
	<div class="home">
		<h1>Welcome to Public Chat</h1>
		<input v-model="username" placeholder="Enter your username" />
		<button :disabled="!isUsernameValid" @click="joinChat">Join Chat</button>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
	name: 'HomePage',
	setup() {
		const router = useRouter()
		const username = ref('')

		// Load username from localStorage if available
		onMounted(() => {
			const storedUsername = localStorage.getItem('username')
			if (storedUsername) {
				username.value = storedUsername
			}
		})

		// Computed property to check if the username is valid
		const isUsernameValid = computed(() => username.value.trim().length >= 3)

		const joinChat = () => {
			if (isUsernameValid.value) {
				// Save username to localStorage
				localStorage.setItem('username', username.value)
				router.push({ name: 'ChatPage', query: { username: username.value } })
			}
		}

		return {
			username,
			isUsernameValid,
			joinChat
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
</style>
