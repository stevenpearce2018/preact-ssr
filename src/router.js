import { h } from 'preact'
import Router from 'preact-router'

import { App } from "./App";
import { About } from "./Components/About";
import { Search } from './Components/Search';
import Login from "./Components/Login";
import { SignUp } from "./Components/Signup"
import MyCoupons from "./Components/MyCoupons";
import UploadCoupons from "./Components/UploadCoupons";

import AsyncRoute from 'preact-async-route';

export default () => (
	<Router>
		<App path="/:category?" />
		<AsyncRoute path="/about" component={About} />
		<AsyncRoute path="/search" component={Search} />
		<AsyncRoute path="/login" component={Login} />
		<AsyncRoute path="/signup" component={SignUp} />
		<AsyncRoute path="/mycoupons" component={MyCoupons} />
		<AsyncRoute path="/uploadcoupons" component={UploadCoupons} />
	</Router>
)
