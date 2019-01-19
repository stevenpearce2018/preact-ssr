import { h } from 'preact'
import Router from 'preact-router'

import { App } from "./App";
import { About } from "./About";
import Search from './Search';
import Login from "./Login";
import Signup from "./Signup"
import AccountSettings from "./AccountSettings";
import UploadCoupons from "./UploadCoupons";

export default () => (
	<Router>
		<App path="/:category?" />
		<About path="/about" />
		<Search path="/search" />
		<Login path="/login" />
		<Signup path="/signup" />
		<AccountSettings path="/accountsettings"/>
		<UploadCoupons path="/uploadcoupons"/>
	</Router>
)
