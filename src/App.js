import { h, render, Component} from 'preact'
import { connect } from 'unistore/preact'

import { actions } from './store/store'
import Helmet from "preact-helmet";
import Nav from "./Nav";
import getParameterByName from "./getParameterByName";
// import CouponsMaker from "./couponsMaker";

export const App = connect(["email", "logginkey", "lat", "long"], actions)(
    ({ lat, long, email, logginkey, login, logout, setLocation }) => (
      <SubApp setLocation={setLocation} lat={lat} email={email} logginkey={logginkey} login={login} logout={logout} long={long}/>
    )
  )

class SubApp extends Component {
  constructor(props) {
    super(props);
    this.state.coupons = <div className="loaderContainer"><div className="loader"></div></div>;
    // this.state.pageNumber = getParameterByName('pageNumber', '/'+window.location.href.substring(window.location.href.lastIndexOf('/')+1, window.location.href.length)) || 1
    this.state.pageNumber = 1
  }
  
  componentDidMount() {
    const that = this;
    if (navigator && navigator.geolocation && !this.props.lat && !this.props.long) navigator.geolocation.getCurrentPosition(showPosition);
    function showPosition(location) {
      const url = `/api/geoCoupons/${location.coords.longitude}/${location.coords.latitude}/${that.state.pageNumber}`;
      that.props.setLocation({ long: location.coords.longitude, lat: location.coords.latitude })
      fetch(url, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "default", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }).then(data=> {
          if(data && data.coupons && data.coupons.length > 0) that.setState({coupons: CouponsMaker(data.coupons), incrementPageClass: "center marginTop"})
          else that.setState({coupons: <h2 className="center paddingTop">No coupons found based on your location or we could not get your location. Please try searching manually.</h2>})
      });
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