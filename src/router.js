import { h } from 'preact'
import Router from 'preact-router'

import { App } from "./App";
import { About } from "./Components/About";
import Search from './Components/Search';
import Login from "./Components/Login";
import Signup from "./Components/Signup"
import AccountSettings from "./Components/AccountSettings";
import UploadCoupons from "./Components/UploadCoupons";

import AsyncRoute from 'preact-async-route';

export default () => (
	<Router>
		<App path="/:category?" />
		<AsyncRoute path="/about" component={About} />
		<AsyncRoute path="/search" component={Search} />
		<AsyncRoute path="/login" component={Login} />
		<AsyncRoute path="/signup" component={Signup} />
		<AsyncRoute path="/accountsettings" component={AccountSettings} />
		<AsyncRoute path="/uploadcoupons" component={UploadCoupons} />
	</Router>
)
