import { h, render, Component} from 'preact'
import { connect } from 'unistore/preact'

import { actions } from './store/store'
import Helmet from "preact-helmet";
import Nav from "./Nav";
import getParameterByName from "./Lib/getParameterByName";
import CouponsMaker from "./SubComponents/CouponsMaker/couponsMaker";
import CenterText from "./SubComponents/CenterText/centerText";

export const App = connect(["email", "loggedInKey", "lat", "long"], actions)(
    ({ lat, long, email, loggedInKey, login, logout, setLocation }) => (
      <SubApp setLocation={setLocation} lat={lat} email={email} loggedInKey={loggedInKey} login={login} logout={logout} long={long}/>
    )
  )

class SubApp extends Component {
  constructor(props) {
    super(props);
    this.getCoupons = this.getCoupons.bind(this);
    this.getCouponsByUrl = this.getCouponsByUrl.bind(this);
    this.state.coupons = this.props.coupons || <div><CenterText text={"We need your know your location to find coupons near you."}/><button className="btn-normal" onClick={this.getCoupons}>Allow Location</button></div>;
    this.state.pageNumber = 1;
  }

  componentDidMount(){
    if(this.props.long && this.props.lat) this.getCouponsByUrl(`/api/geoCoupons/${this.props.long}/${this.props.lat}/${this.state.pageNumber}`, {lat: this.props.lat, long: this.props.long})
  }

  getCouponsByUrl(url, location) {
    this.setState({coupons: <div className="loaderContainer"><img src="./spinner.gif" alt="Loading coupons near you."/></div>})
    fetch(url, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      cache: "default", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, same-origin, *omit
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    }).then(res => res.json()).then(data => this.setState({coupons: CouponsMaker(data, location)}));
  }

  getCoupons(){
    const that = this;
    if (navigator && navigator.geolocation && !this.props.lat && !this.props.long) navigator.geolocation.getCurrentPosition(showPosition)
    else this.getCouponsByUrl(`/api/geoCoupons/${this.props.long}/${this.props.lat}/${this.state.pageNumber}`, {lat: this.props.lat, long: this.props.long})
    function showPosition(location) {
      that.props.setLocation({ long: location.coords.longitude, lat: location.coords.latitude })
      that.getCouponsByUrl(`/api/geoCoupons/${location.coords.longitude}/${location.coords.latitude}/${that.state.pageNumber}`, { long: location.coords.longitude, lat: location.coords.latitude })
    }
  }

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
        {this.state.coupons}
          <button className="btn-normal" onClick={() => this.props.login({email: "BusinessOwner@gmail.com", loggedInKey: "dsadadadsad:b"})}>Business Login</button>
          <button className="btn-normal" onClick={() => this.props.login({email: "Customer@gmail.com", loggedInKey: "dsadadadsad:c"})}>Customer Login</button>
          <button className="btn-normal" onClick={() => this.props.logout()}>Logout</button>
        </div>
      </div>
      )
    }
  }