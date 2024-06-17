<!-- ChatPage.vue -->

<template>
  <div class="chat">
    <h2>Public Chat</h2>
    <p>Welcome, {{ username }}</p>
    <div class="users">
      <h3>Connected Users:</h3>
      <ul>
        <li v-for="user in connectedUsers" :key="user">{{ user }}</li>
      </ul>
    </div>
    <div class="messages">
      <h3>Messages:</h3>
      <ul>
        <li v-for="msg in chatMessages" :key="msg.id">
          <strong>{{ msg.user }} ({{ msg.time }}):</strong> {{ msg.text }}
        </li>
      </ul>
    </div>
    <input v-model="newMessage" placeholder="Type a message" @keyup.enter="sendMessage" />
    <button :disabled="isMessageEmpty" @click="sendMessage">Send</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { io } from 'socket.io-client'
import { useStore } from 'vuex'

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
}

export default defineComponent({
  name: 'ChatPage',
  setup() {
    const route = useRoute()
    const username = ref<string>('')
    const newMessage = ref('')

    const store = useStore()

    onMounted(() => {
      const storedUsername = localStorage.getItem('username')
      if (storedUsername) {
        username.value = storedUsername
      } else {
        username.value = route.params.username as string
        localStorage.setItem('username', username.value)
      }

      // Socket.io connection
      const socket = io('http://localhost:3000')
      socket.emit('join', username.value)

      socket.on('users', (connectedUsers: string[]) => {
        store.dispatch('addUser', connectedUsers)
      })

      socket.on('message', (message: ChatMessage) => {
        store.dispatch('addMessage', message)
      })

      onBeforeUnmount(() => {
        socket.disconnect()
      })
    })

    const sendMessage = () => {
      if (newMessage.value.trim()) {
        const now = new Date()
        const message: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          user: username.value,
          text: newMessage.value,
          time: `${now.getHours()}:${now.getMinutes()}`
        }
        // Utilisation de Vuex pour ajouter le message
        store.dispatch('addMessage', message)
        const socket = io('http://localhost:3000')
        socket.emit('message', message)
        newMessage.value = ''
      }
    }

    // Utilisation de computed pour extraire les données de l'état global
    const connectedUsers = computed(() => store.state.users)
    const chatMessages = computed(() => store.state.messages)

    // Propriété calculée pour vérifier si le champ de message est vide
    const isMessageEmpty = computed(() => newMessage.value.trim().length === 0)

    return {
      username,
      newMessage,
      sendMessage,
      connectedUsers,
      chatMessages,
      isMessageEmpty
    }
  }
})
</script>

<style scoped>
/* Styles peuvent être ajoutés ici */
</style>
