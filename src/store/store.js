import createStore from 'unistore'

export const actions = store => ({
	setLocation(state, data) {
		return { lat: data.lat, long: data.long }
	},
	login(state, data) {
		return { logginkey: data.logginkey, email: data.email }
	},
	logout(state) {
		return { logginkey: undefined, email: undefined }
	},
})

export default initialState => createStore(initialState)