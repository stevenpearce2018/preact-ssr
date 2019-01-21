import createStore from 'unistore'

export const actions = store => ({
	setLocation(state, data) {
		return { lat: data.lat, long: data.long }
	},
	login(state, data) {
		return { loggedInKey: data.loggedInKey, email: data.email }
	},
	toggleMenu(state) {
		return { menuActive: !state.menuActive }
	},
	logout(state) {
		return { loggedInKey: undefined, email: undefined }
	},
})

export default initialState => createStore(initialState)