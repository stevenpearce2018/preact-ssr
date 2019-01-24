import { h, render, Component } from 'preact';
import preact from 'preact';
import Nav from '../Nav';
import Helmet from "preact-helmet";
import { FieldSet } from "../SubComponents/FieldSet/fieldSet";
import CenterText from "../SubComponents/CenterText/centerText";
import { connect } from 'unistore/preact';
import { actions } from '../store/store';
import validateEmail from "../Lib/validateEmail";
import checkPasswordStrength from "../Lib/checkPasswordStrength";
import { route } from 'preact-router';
import Popup from "../SubComponents/Popup/popup";

export const Login = connect(["loggedInKey"], actions)(
    ({ login, loggedInKey }) => (
      <SubLogin login={login} loggedInKey={loggedInKey}/>
    )
  )

class SubLogin extends Component {
  constructor(props) {
    super(props);
    this.state = { popup: undefined, email: undefined, password: undefined, showPass: false };
    this.handleChange = this.handleChange.bind(this);
    this.login = this.login.bind(this);
  }

  componentDidMount(){
    if(this.props.loggedInKey || this.props.email) route("/")
  }

  handleChange(event){
    const { target: { name, value } } = event
    this.setState({ [name]: value })
  }

  login(){
    if(checkPasswordStrength(this.state.password) && validateEmail(this.state.email)) {
      const body = { email: this.state.email, password: this.state.password }
      fetch('/api/signin', {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "default", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(body)
      }).then(res => res.json()).then(data => {
        this.setState({popup: <Popup delay={5000} success={true}>Welcome {this.state.email}!</Popup>})
        // this.props.login({email: this.state.email, loggedInKey: data.loggedInKey})
        // route("/")
      });
    } else this.props.setPopup({text: "Failed to login!", success: false})
  }

  render(props, state) {
    const html =
    <div className="container">
      {/* <Popup delay={5000} success={false}>This is an alert</Popup> */}
      <Nav/>
      <Helmet
        htmlAttributes={{lang: "en", amp: undefined}} // amp takes no value
        title="Search for coupons and deals for restaurants, spas, gyms, and retail locations near you!"
        titleTemplate="UnlimitedCouponer.com - %s"
        defaultTitle="Find coupons and deals for restaurants, spas, gyms, and retail."
        titleAttributes={{itemprop: "name", lang: "en"}}
        // base={{target: "_blank", href: "http://mysite.com/"}}
        meta={[
            {name: "sdescription", content: "Helmet application"},
            {property: "og:type", content: "article"}
        ]}
        />
        <CenterText text={"Login"}/>
        <FieldSet label="Email" name="email" htmlFor="email" placeholder="Email@email.com" type="email" required={true} onChange={this.handleChange} />
        <FieldSet label="Password" name="password" htmlFor="password" placeholder="Password123!" type={this.state.showPass ? "text" : "password"} required={true} onChange={this.handleChange} />
        <button className={checkPasswordStrength(this.state.password) && validateEmail(this.state.email) ? "marginTop btn-normal" : "marginTop btn-invalid"} onClick={this.login}>Submit</button>
    </div>
    return html;
  }
}

export default Login;
