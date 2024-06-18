import { createStore } from 'vuex';

interface User {
	username: string;
	password: string;
}

interface State {
	users: User[];
	currentUser: User | null;
	messages: any[]; // Adjust type according to your message structure
}

export default createStore<State>({
	state: {
		users: [],
		currentUser: null,
		messages: []
	},

	mutations: {
		addUser(state, user: User) {
			state.users.push(user);
		},
		setCurrentUser(state, user: User) {
			state.currentUser = user;
		},
		addMessage(state, message: any) { // Adjust type according to your message structure
			state.messages.push(message);
		},
		setUsers(state, users: User[]) {
			state.users = users;
		},
		setMessages(state, messages: any[]) { // Adjust type according to your message structure
			state.messages = messages;
		},
		clearMessages(state) {
			state.messages = [];
		},
		setUsername(state, username: string) {
			state.currentUser = { username, password: '' }; // Temporary structure based on username only
		},
		setUsersInRoom(state, users: User[]) {
			state.users = users;
		}
	},

	actions: {
		loginUser({ commit, state }, { username, password }: { username: string, password: string }) {
			const user = state.users.find(u => u.username === username && u.password === password);
			if (user) {
				commit('setCurrentUser', user);
			} else {
				throw new Error('Invalid username or password');
			}
		},
		sendMessage({ commit, state }, message: any) { // Adjust type according to your message structure
			if (state.currentUser) {
				commit('addMessage', {
					username: state.currentUser.username,
					message: message,
					timestamp: new Date().toISOString()
				});
			} else {
				throw new Error('User not logged in');
			}
		}
	},
	getters: {
		getUsers(state) {
			return state.users;
		},
		getCurrentUser(state) {
			return state.currentUser;
		},
		getMessages(state) {
			return state.messages;
		}
	}
});
