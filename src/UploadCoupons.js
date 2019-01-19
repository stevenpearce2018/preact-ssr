import { h, render, Component} from 'preact'
import { connect } from 'unistore/preact'

import { actions } from './store/store'
import Helmet from "preact-helmet";
import Fieldset from "./SubComponents/FieldSet/fieldSet"
import Nav from "./Nav";

class UploadCoupons extends Component {
  render() {
    return (
      <div className="flextape">
      <Nav/>
        <div className="center">
            <h2 className="holder marginBottom">Coupon Form</h2>
        </div>
      </div>
    )
  }
}

export default UploadCoupons; 