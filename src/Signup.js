import { h, render, Component } from 'preact';
import preact from 'preact';
import Nav from './Nav'
import Helmet from "preact-helmet";
import { FieldSet } from "./SubComponents/FieldSet/fieldSet";

export default class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = { isCustomer: true };
    this.toggle = this.toggle.bind(this);
  }

  toggle(isAlreadySelected) {
    isAlreadySelected ? alert("You have already selected this option.") : this.setState({isCustomer: !this.state.isCustomer})
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
        <FieldSet label="Email" name="email" htmlFor="Email@gmail.com" placeholder="email" type="email" required={true}/>
        <FieldSet label="Password" name="password" htmlFor="password" placeholder="Password123!" type="password" required={true}/>
        <button className="marginTop btn-invalid" onClick={() => alert("Test 3")}>Submit</button>
    </div>
    return html;
  }
}
