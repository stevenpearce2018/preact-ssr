import { h, render, Component} from 'preact'
import { connect } from 'unistore/preact'

import { actions } from '../store/store'
import Helmet from "preact-helmet";
import Fieldset from "../SubComponents/FieldSet/fieldSet"
import Nav from "../Nav";

class AccountSettings extends Component {
  render() {
    return (
    <div>
        <Nav/>
    <div className="center">
        <h2 className="holder marginBottom">Change Account Settings</h2>
    </div>
    </div>
    )
  }
}

export default AccountSettings;