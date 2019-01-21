import { h, render, Component} from 'preact'
import { connect } from 'unistore/preact'
import Nav from "../Nav";
import { actions } from '../store/store'
import Helmet from "preact-helmet";
import Fieldset from "../SubComponents/FieldSet/fieldSet";
import CenterText from "../SubComponents/CenterText/centerText";
import { route } from 'preact-router';
import Popup from "../SubComponents/Popup/popup";

export const UploadCoupons = connect(["email", "loggedInKey", "lat", "long"], actions)(
  ({ loggedInKey, email }) => (
    <SubUploadCoupons loggedInKey={loggedInKey} email={email}/>
  )
)

class SubUploadCoupons extends Component {
  render() {
    return (
      <div className="flextape">
      <Nav/>
        <CenterText text={"Coupon Form"}/>
        
      </div>
    )
  }
}