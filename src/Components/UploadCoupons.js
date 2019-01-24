import { h, render, Component} from 'preact';
import { connect } from 'unistore/preact';
import { actions } from '../store/store';
import Helmet from "preact-helmet";
import { FieldSet } from "../SubComponents/FieldSet/fieldSet";
import Nav from "../Nav";
import CenterText from "../SubComponents/CenterText/centerText";
import { route } from 'preact-router';
import CouponsMaker from "../SubComponents/CouponsMaker/couponsMaker";

export const UploadCoupons = connect(["email", "loggedInKey", "lat", "long"], actions)(
  ({ loggedInKey, email }) => (
    <SubUploadCoupons loggedInKey={loggedInKey} email={email}/>
  )
)

class SubUploadCoupons extends Component {
  constructor(props) {
    super(props);
    this.state = { title: undefined, city: true, zip: undefined, address: undefined };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event){
    const { target: { name, value } } = event
    this.setState({ [name]: value })
  }
  // componentDidMount(){
  //   if(!this.props.loggedInKey || !this.props.email) route("/")
  // }

  render() {
    return (
    <div>
      <Nav/>
      <Helmet
        htmlAttributes={{lang: "en", amp: undefined}} // amp takes no value
        title="Upload coupons for your business today!"
        titleTemplate="UnlimitedCouponer.com - %s"
        defaultTitle="Upload coupons and deals for restaurants, spas, gyms, and retail."
        titleAttributes={{itemprop: "name", lang: "en"}}
        // base={{target: "_blank", href: "http://mysite.com/"}}
        meta={[
            {name: "sdescription", content: "Helmet application"},
            {property: "og:type", content: "article"}
        ]}
        />
        <div className='noMarginBottom marginTop'>
          <CenterText text="Enter your coupon details below. You can see how yours will look with the example coupon."/>
        </div>
        <div className='couponHolder'>
        {CouponsMaker([{
          ignoreFlex: true,
          title: this.state.title || "Example Coupon",
          currentPrice: this.state.currentPrice || 10.00,
          discountedPrice: this.state.discountedPrice || 5.00,
          amountCoupons: this.state.amountCoupons || 100,
          textarea: this.state.textarea || "textarea", 
          address: this.state.address || 3123123123,
          latitude: this.state.longitude || 152,
          longitude: this.state.longitude || 1233,
          city: this.state.city || "city",
          base64image: this.state.base64image || "https://www.petsworld.in/blog/wp-content/uploads/2014/09/cute-kittens.jpg"
        }], {long: 12312, lat:123123})}
        <div className="coupon marginTopBig">
          <br/>
          <h2 className = "ctitle marginTop marginBottom">Enter Coupon Details</h2>
          <FieldSet label="Title" name="title" htmlFor="title" placeholder="Bob's Kitten Rentals" type="text" required={true} onChange={this.handleChange} />
          <FieldSet label="City" name="city" htmlFor="city" placeholder="Boston" type="email" required={true} onChange={this.handleChange} />
          <FieldSet label="Address" name="address" htmlFor="address" placeholder="13389 Kitten Park Avenue" type="text" required={true} onChange={this.handleChange} />
          <FieldSet label="Zip" name="zip" htmlFor="zip" placeholder="55555" type="number" required={true} onChange={this.handleChange} />
          <div className="btnHolderTwo">
            <button className="btn-normal" onClick={() => alert("Upload Image")}>Upload Image</button>
            <button className="btn-normal" onClick={() => alert("Upload Coupons")}>Upload Coupons</button>
          </div>
        </div>
        </div>
      </div>
    )
  }
}