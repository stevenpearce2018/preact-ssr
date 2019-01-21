import { h, render, Component } from 'preact';
import preact from 'preact';
import Nav from '../Nav';
import Helmet from "preact-helmet";
import { FieldSet } from "../SubComponents/FieldSet/fieldSet";
import { connect } from 'unistore/preact';
import { actions } from '../store/store';
import checkPasswordStrength from "../Lib/checkPasswordStrength";
import { route } from 'preact-router';

export const SignUp = connect(["email", "loggedInKey"], actions)(
  ({ loggedInKey, email }) => (
    <SubSignUp loggedInKey={loggedInKey} email={email}/>
  )
)

class SubSignUp extends Component {
  constructor(props) {
    super(props);
    this.state = { isCustomer: true, email: undefined, password: undefined };
    this.toggle = this.toggle.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.register = this.register.bind(this);
  }

  handleChange(event){
    const { target: { name, value } } = event
    this.setState({ [name]: value })
  }

  toggle(isAlreadySelected) {
    isAlreadySelected ? alert("You have already selected this option.") : this.setState({isCustomer: !this.state.isCustomer})
  }

  register(){
    if(checkPasswordStrength(this.state.password) && validateEmail(this.state.email)) {
      const body = { email: this.state.email, password: this.state.password, yourPick: this.state.isCustomer ? ' Customer' : ' Business Owner' }
      fetch('/api/signup', {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "default", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(body)
      }).then(res => res.json()).then(data => this.props.login({email: this.state.email, loggedInKey: data.loggedInKey}));
    }
  }

  render(props, state) {
    const html =
    <div>
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
      <div className="center">
        <h2 className="holder marginBottom">Sign Up {this.state.isCustomer}</h2>
        <h3 className="marginBottom marginTop">Are you a customer or business owner?</h3>
        <button className={this.state.isCustomer ? "btn-normal" : "btn-invalid"} onClick={() => this.toggle(this.state.isCustomer)}>Customer</button>
        <button className={this.state.isCustomer ? "btn-invalid" : "btn-normal"} onClick={() => this.toggle(!this.state.isCustomer)}>Business Owner</button>
      </div>
      <FieldSet label="Email" name="email" htmlFor="email" placeholder="Email@gmail.com" type="email" required={true} onChange={this.onChange} />
      <FieldSet label="Password" name="password" htmlFor="password" placeholder="Password123!" type="password" required={true} onChange={this.onChange} />
      <button className={checkPasswordStrength(this.state.password) && validateEmail(this.state.email) ? "marginTop btn-normal" : "marginTop btn-invalid"}  onClick={() => alert("Test 3")}>Submit</button>
      
    </div>
    return html;
  }
}
