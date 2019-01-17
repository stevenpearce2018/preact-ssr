import { h } from 'preact'
import Router from 'preact-router'

import { App } from "./App";
import { About } from "./About";
import Search from './Search';
import Login from "./Login";
import Signup from "./Signup"

export default () => (
	<Router>
		<App path="/:category?" />
		<About path="/about" />
		<Search path="/search" />
		<Login path="/login" />
		<Signup path="/signup" />
	</Router>
)
