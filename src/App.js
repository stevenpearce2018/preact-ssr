import { h, render, Component} from 'preact'
import { connect } from 'unistore/preact'

import { actions } from './store/store'
import Helmet from "preact-helmet";
import Nav from "./Nav";
import getParameterByName from "./Lib/getParameterByName";
import CouponsMaker from "./SubComponents/CouponsMaker/couponsMaker";

export const App = connect(["email", "logginkey", "lat", "long"], actions)(
    ({ lat, long, email, logginkey, login, logout, setLocation }) => (
      <SubApp setLocation={setLocation} lat={lat} email={email} logginkey={logginkey} login={login} logout={logout} long={long}/>
    )
  )

class SubApp extends Component {
  constructor(props) {
    super(props);
    this.state.coupons = <div className="loaderContainer"><img src="./spinner.gif"/></div>;
    this.state.pageNumber = 1
  }
  
  componentDidMount() {
    const that = this;
    if (navigator && navigator.geolocation && !this.props.lat && !this.props.long) navigator.geolocation.getCurrentPosition(showPosition)
    else {
      fetch(`/api/geoCoupons/${this.props.long}/${this.props.lat}/${that.state.pageNumber}`, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "default", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }).then(res => res.json()).then(data => that.setState({coupons: CouponsMaker(data.coupons, {lat: this.props.lat, long: this.props.long})}));
    }
    function showPosition(location) {
      that.props.setLocation({ long: location.coords.longitude, lat: location.coords.latitude })
      getCoupons(`/api/geoCoupons/${location.coords.longitude}/${location.coords.latitude}/${that.state.pageNumber}`)
    }
    const getCoupons = url => {
      fetch(url, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "default", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }).then(res => res.json()).then(data => that.setState({coupons: CouponsMaker(data.coupons, {lat: that.props.lat, long: that.props.long})}));
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
          <button className="btn-normal" onClick={() => this.props.login({email: "BusinessOwner@gmail.com", logginkey: "dsadadadsad:b"})}>Business Login</button>
          <button className="btn-normal" onClick={() => this.props.login({email: "Customer@gmail.com", logginkey: "dsadadadsad:c"})}>Customer Login</button>
          <button className="btn-normal" onClick={() => this.props.logout()}>Logout</button>
        </div>
      </div>
      )
    }
  }