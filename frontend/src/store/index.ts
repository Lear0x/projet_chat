// store/index.ts

import { createStore } from 'vuex'

interface ChatMessage {
	id: string;
	user: string;
	text: string;
	time: string;
}

interface State {
	users: string[];
	messages: ChatMessage[];
}

const store = createStore<State>({
	state: {
		users: [],
		messages: []
	},
	mutations: {
		addUser(state, user: string) {
			if (!state.users.includes(user)) {
				state.users.push(user);
			}
		},
		removeUser(state, user: string) {
			state.users = state.users.filter(u => u !== user);
		},
		addMessage(state, message: ChatMessage) {
			state.messages.push(message);
		}
	},
	actions: {
		addUser({ commit }, user: string) {
			commit('addUser', user);
		},
		removeUser({ commit }, user: string) {
			commit('removeUser', user);
		},
		addMessage({ commit }, message: ChatMessage) {
			commit('addMessage', message);
		}
	},
	modules: {}
});

export default store;
