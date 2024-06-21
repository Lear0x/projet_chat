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
							<img v-if="message.imageBase64" :src="message.imageBase64"/>
							<div class="message-text">{{ message.message }}</div>
							<div class="message-time">{{ message.timestamp }}</div>
						</div>
					</div>
				</div>
			</div>
			<div class="chat-input">
				<label for="fileInput" class="file-upload-btn">🔗</label>
				<input id="fileInput" type="file" ref="fileInput" @change="handleFileUpload" style="display: none;">
				<input type="text" v-model="newMessage" @keypress.enter="sendMessage" placeholder="Type your message here..." />
				<button @click="sendMessage" :disabled="!canSendMessage">Envoyer</button>
				<img v-if="previewImage" :src="previewImage" alt="Image preview" class="image-preview" />
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

		const fileInputRef = ref<HTMLInputElement | null>(null);
		const previewImage = ref<string | null>(null);

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
				ws = new WebSocket('ws://localhost:8080/socket')

				ws.onopen = () => {
					ws?.send(JSON.stringify({ type: 'join', username: username.value, room: 'public_room' }))
					console.log('WebSocket connection established')
				}

				ws.onmessage = async (event) => {
					const message = JSON.parse(event.data)
					console.log(message);
					if(message.message != 'logout' && message.message != 'login') {
						store.commit('addMessage', message)
					} else if (message.message == 'logout' && message.message != 'login'){
						const messgeLogout = {
							username: ' ',
							message: `${message.username} a quitté la conversation`,
							timestamp: new Date().toLocaleTimeString(),
						}
						store.commit('addMessage', messgeLogout);
						
						const response = await axios.get(`http://localhost:3000/users-in-room/public_room`)

						connectedUsers.value = response.data.users
						if (!connectedUsers.value.includes(username.value)) {
							connectedUsers.value.push(username.value)
						}
					} else if (message.message == 'login') {
						const messgeLogin = {
							username: ' ',
							message: `${message.username} a rejoint la conversation`,
							timestamp: new Date().toLocaleTimeString(),
						}
						store.commit('addMessage', messgeLogin);
						
						const response = await axios.get(`http://localhost:3000/users-in-room/public_room`)

						connectedUsers.value = response.data.users
						if (!connectedUsers.value.includes(username.value)) {
							connectedUsers.value.push(username.value)
						}
					}
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

		const canSendMessage = computed(() => {
            return newMessage.value.trim() !== '' || previewImage.value !== null;
        });

		const sendMessage = async () => {
			if (newMessage.value.trim() || previewImage.value != null) {
				console.log(previewImage);
				try {	

					if(previewImage.value != null) {
						await axios.post('http://localhost:3000/send-to-room', {
							username: username.value,
							message: newMessage.value,
							room: 'public_room',
							imageBase64: previewImage.value,
						})
					} else {
						const d = await axios.post('http://localhost:3000/send-to-room', {
							username: username.value,
							message: newMessage.value,
							room: 'public_room',
						});

						console.log('send', d);
					}

					newMessage.value = '';
					previewImage.value = null;
				} catch (error) {
					console.error('Error sending message:', error)
				}
			}
		}

		const logout = async () => {

			try {
				await axios.post('http://localhost:3000/signOut', {
					username: username.value,
					room: 'public_room',
				})	;
			} catch (error) {
				console.error('Error leaving room:', error)
			}


			localStorage.removeItem('username')
			store.commit('setUsername', '')
			store.commit('setUsersInRoom', [])
			store.commit('clearMessages')
			router.push({ name: 'HomePage' }) // Redirection vers la page d'accueil
		}

        const handleFileUpload = (event: Event) => {
            const files = (event.target as HTMLInputElement).files;
            if (files && files.length > 0) {
                const file = files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImage.value = e.target?.result as string;
                };
                reader.readAsDataURL(file);
                // Vous pouvez maintenant utiliser 'file' pour l'envoyer ou le manipuler
                console.log('File selected:', file.name);
            }
        }

        const openFileInput = () => {
            fileInputRef.value?.click();
        }

		const toBase64 = (file: Blob) => new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result);
			reader.onerror = reject;
		})

		return {
			username,
			newMessage,
			connectedUsers,
			messages,
			sendMessage,
			logout,
			handleFileUpload,
            openFileInput,
            fileInputRef,
			previewImage,
			canSendMessage,
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

.my-message .message-content {
	flex-direction: row-reverse;
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
    align-items: center;
    padding: 10px;
    background-color: #eee;
    border-top: 1px solid #ccc;
}

.file-upload-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    font-size: 1.2em;
    color: #9c27b0;
}

.file-upload-icon:hover {
    color: #7b1fa2;
}

.chat-input button {
    background-color: #9c27b0;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 10px;
}
.chat-input input[type="text"] {
	width: 100%;
}

.chat-input button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.image-preview {
    max-width: 100px;
    max-height: 100px;
    margin-left: 10px;
}
</style>
