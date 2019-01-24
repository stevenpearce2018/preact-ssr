import { h, render, Component} from 'preact';
import { connect } from 'unistore/preact';
import { actions } from '../store/store';
import Helmet from "preact-helmet";
import { Fieldset } from "../SubComponents/FieldSet/fieldSet";
import Nav from "../Nav";
import CenterText from "../SubComponents/CenterText/centerText";
import { route } from 'preact-router';
import Popup from "../SubComponents/Popup/popup";

export const MyCoupons = connect(["email", "loggedInKey", "lat", "long"], actions)(
  ({ loggedInKey, email }) => (
    <SubMyCoupons loggedInKey={loggedInKey} email={email}/>
  )
)

class SubMyCoupons extends Component {

  componentDidMount(){
    if(!this.props.loggedInKey || !this.props.email) route("/")
  }

  render() {
    return (
    <div>
      <Nav/>
      <CenterText text={"Change Account Settings"}/>
      
    </div>
    )
  }
}