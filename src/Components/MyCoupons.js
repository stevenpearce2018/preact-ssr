import { h, render, Component} from 'preact'
import { connect } from 'unistore/preact'

import { actions } from '../store/store'
import Helmet from "preact-helmet";
import Fieldset from "../SubComponents/FieldSet/fieldSet"
import Nav from "../Nav";
import CenterText from "../SubComponents/CenterText/centerText";

class MyCoupons extends Component {
  render() {
    return (
    <div>
      <Nav/>
      <CenterText text={"Change Account Settings"}/>
    </div>
    )
  }
}

export default MyCoupons;