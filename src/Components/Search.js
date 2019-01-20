import { h, render, Component } from 'preact';
import preact from 'preact';
import Nav from '../Nav'
import Helmet from "preact-helmet";
import { FieldSet } from "../SubComponents/FieldSet/fieldSet"

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = { keywords: undefined, city: undefined, zip: undefined };
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(event){
    const { target: { name, value } } = event
    this.setState({ [name]: value })
  }
  render(props, state) {
    const html =
    <div className="container">
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
          <h2 className="holder marginBottom">Search</h2>
        </div>
        <FieldSet label="City" name="city" htmlFor="city" placeholder="Boston" type="text" handleChange={this.handleChange}/>
        <FieldSet label="Zip" name="zip" htmlFor="zip" placeholder="55555" type="number" handleChange={this.handleChange} />
        <FieldSet label="Key Words" name="keywords" htmlFor="keywords" placeholder="Pizza, Avacado Toast, Fine Wine" type="text" handleChange={this.handleChange}/>
        <button className="marginTop btn-invalid" onClick={() => alert("Test 3")}>Submit</button>
    </div>
    return html;
  }
}
