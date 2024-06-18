<template>
	<div class="chat-container">
		<div class="connected-users">
			<h2>Utilisateurs connectés</h2>
			<ul>
				<li v-for="user in connectedUsers" :key="user">
					<span class="user-avatar">{{ user.charAt(0).toUpperCase() }}</span>
					{{ user }}
				</li>
			</ul>
			<button @click="logout">Se déconnecter</button>
		</div>
		<div class="chat-room">
			<div class="chat-header">
				<h2>Chat Room</h2>
			</div>
			<div class="chat-messages">
				<div v-for="message in messages" :key="message.id"
					:class="['chat-message', { 'my-message': message.username === username }]">
					<div class="message-content">
						<span class="message-user">{{ message.username.charAt(0).toUpperCase() }}</span>
						<div class="message-body">
							<div class="message-text">{{ message.message }}</div>
							<div class="message-time">{{ message.timestamp }}</div>
						</div>
					</div>
				</div>
			</div>
			<div class="chat-input">
				<input type="text" v-model="newMessage" @keypress.enter="sendMessage"
					placeholder="Type your message here..." />
				<button @click="sendMessage" :disabled="!newMessage.trim()">Envoyer</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axios from 'axios'

export default defineComponent({
	name: 'ChatPage',
	setup() {
		const route = useRoute()
		const router = useRouter()
		const store = useStore()
		const username = ref('')
		const newMessage = ref('')
		const connectedUsers = ref<string[]>([])
		const messages = computed(() => store.state.messages)
		let ws: WebSocket | null = null

		onMounted(async () => {
			const storedUsername = localStorage.getItem('username')
			if (storedUsername) {
				username.value = storedUsername
			} else {
				username.value = route.params.username as string
				localStorage.setItem('username', username.value)
			}

			try {
				console.log('username', username.value);
				const responseJoin = await axios.post('http://localhost:3000/join-room', {
					username: username.value,
					room: 'public_room',
				})
				
				console.log(responseJoin)

				const response = await axios.get(`http://localhost:3000/users-in-room/public_room`)
				connectedUsers.value = response.data.users
				if (!connectedUsers.value.includes(username.value)) {
					connectedUsers.value.push(username.value)
				}

				// Initialiser la connexion WebSocket
				ws = new WebSocket('ws://localhost:3000')

				ws.onopen = () => {
					ws?.send(JSON.stringify({ type: 'join', username: username.value, room: 'public_room' }))
					console.log('WebSocket connection established')
				}

				ws.onmessage = (event) => {
					const message = JSON.parse(event.data)
					console.log(message);
					store.commit('addMessage', message)
					console.log("messages", messages.value);
				}

				ws.onerror = (error) => {
					console.error('WebSocket error: ', error)
				}

				ws.onclose = () => {
					console.log('WebSocket connection closed')
				}
			} catch (error) {
				console.error('Error getting users:', error)
			}
		})

		onBeforeUnmount(() => {
			if (ws) {
				ws.close()
			}
		})

		const sendMessage = async () => {
			if (newMessage.value.trim()) {
				// const messageObj = {
				// 	username: username.value,
				// 	text: newMessage.value,
				// 	time: new Date().toLocaleString(),
				// }
				// store.commit('addMessage', messageObj)
				try {
					await axios.post('http://localhost:3000/send-to-room', {
						username: username.value,
						message: newMessage.value,
						room: 'public_room',
					})
					newMessage.value = ''
				} catch (error) {
					console.error('Error sending message:', error)
				}
			}
		}

		const logout = () => {
			localStorage.removeItem('username')
			store.commit('setUsername', '')
			store.commit('setUsersInRoom', [])
			store.commit('clearMessages')
			router.push({ name: 'HomePage' }) // Redirection vers la page d'accueil
		}

		return {
			username,
			newMessage,
			connectedUsers,
			messages,
			sendMessage,
			logout,
		}
	},
})
</script>

<style scoped>
.chat-container {
	display: flex;
	height: 100vh;
}

.connected-users {
	width: 20%;
	background-color: #6a1b9a;
	color: white;
	padding: 20px;
}

.connected-users h2 {
	margin-top: 0;
}

.connected-users ul {
	list-style: none;
	padding: 0;
}

.connected-users li {
	display: flex;
	align-items: center;
	margin-bottom: 10px;
}

.user-avatar {
	background-color: #8e44ad;
	border-radius: 50%;
	width: 30px;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 10px;
}

.chat-room {
	width: 80%;
	display: flex;
	flex-direction: column;
}

.chat-header {
	background-color: #9c27b0;
	color: white;
	padding: 10px;
	text-align: center;
}

.chat-messages {
	flex: 1;
	padding: 20px;
	overflow-y: auto;
	background-color: #f5f5f5;
}

.chat-message {
	margin-bottom: 15px;
}

.message-content {
	display: flex;
	align-items: center;
}

.message-user {
	background-color: #8e44ad;
	border-radius: 50%;
	width: 30px;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 10px;
}

.message-body {
	background-color: #e0e0e0;
	border-radius: 10px;
	padding: 10px;
	max-width: 70%;
}

.my-message .message-body {
	background-color: #a5d6a7;
}

.message-text {
	margin-bottom: 5px;
}

.message-time {
	font-size: 0.8em;
	color: #757575;
	text-align: right;
}

.chat-input {
	display: flex;
	padding: 10px;
	background-color: #eee;
	border-top: 1px solid #ccc;
}

.chat-input input {
	flex: 1;
	padding: 10px;
	font-size: 1em;
	border: 1px solid #ccc;
	border-radius: 5px;
	margin-right: 10px;
}

.chat-input button {
	background-color: #9c27b0;
	color: white;
	border: none;
	padding: 10px 20px;
	border-radius: 5px;
	cursor: pointer;
}

.chat-input button:disabled {
	background-color: #ccc;
	cursor: not-allowed;
}
</style>
