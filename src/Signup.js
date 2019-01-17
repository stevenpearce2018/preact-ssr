import { h, render, Component } from 'preact';
import preact from 'preact';
import Nav from './Nav'
import Helmet from "preact-helmet";
import { FieldSet } from "./SubComponents/FieldSet/fieldSet";

class SignUp extends Component {
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
        <h2 className="holder marginBottom">Sign Up</h2>
        <h3 className="marginBottom marginTop">Are you a customer or business owner?</h3>
        <button className="btn-normal" onClick={() => alert("Test 1")}>Customer</button>
        <button className="btn-invalid" onClick={() => alert("Test 2")}>Business Owner</button>
    </div>
        <FieldSet label="Email" name="email" htmlFor="email" placeholder="email" type="email" required={true}/>
        <FieldSet label="Password" name="password" htmlFor="password" placeholder="Password123!" type="password" required={true}/>
        <button className="marginTop btn-invalid" onClick={() => alert("Test 3")}>Submit</button>
    </div>
    return html;
  }
}


export default SignUp;
