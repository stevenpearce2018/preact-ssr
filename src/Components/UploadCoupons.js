import { h, render, Component} from 'preact'
import { connect } from 'unistore/preact'
import Nav from "../Nav";

import { actions } from '../store/store'
import Helmet from "preact-helmet";
import Fieldset from "../SubComponents/FieldSet/fieldSet";
import { CenterText } from "../SubComponents/CenterText/centerText";

class UploadCoupons extends Component {
  render() {
    return (
      <div className="flextape">
      <Nav/>
        <CenterText text={"Coupon Form"}/>
      </div>
    )
  }
}

export default UploadCoupons; 