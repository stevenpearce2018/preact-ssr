import { h, render, Component} from 'preact'
import { connect } from 'unistore/preact'

import { actions } from './store/store'
import Helmet from "preact-helmet";
import Nav from "./Nav";

export const App = connect(["email", "logginkey"], actions)(
    ({ lat, long, email, logginkey, login, logout }) => (
      <SubApp lat={lat} email={email} logginkey={logginkey} login={login} logout={logout} long={long}/>
    )
  )

class SubApp extends Component {
    render() {
      return (
        <div className="container">
        <Nav/>
        <Helmet
          htmlAttributes={{lang: "en", amp: undefined}} // amp takes no value
          title="Coupons and Deals to restaurants, spas, gyms, and more."
          titleTemplate="UnlimitedCouponer.com - %s"
          defaultTitle="Coupons from local businesses, try something new today!"
          titleAttributes={{itemprop: "name", lang: "en"}}
          // base={{target: "_blank", href: "http://mysite.com/"}}
          meta={[
              {name: "home description", content: "Helmet application"},
              {property: "og:type", content: "article"}
          ]}
        />
        <div className="holder">
          <p>email: {this.props.email}</p>
          <p>logginkey: {this.props.logginkey}</p>
          <button className="btn-normal" onClick={() => this.props.login({email: "BusinessOwner@gmail.com", logginkey: "dsadadadsad:b"})}>Business Login</button>
          <button className="btn-normal" onClick={() => this.props.login({email: "Customer@gmail.com", logginkey: "dsadadadsad:c"})}>Customer Login</button>
          <button className="btn-normal" onClick={() => this.props.logout()}>Logout</button>
        </div>
      </div>
  
      )
    }
  }