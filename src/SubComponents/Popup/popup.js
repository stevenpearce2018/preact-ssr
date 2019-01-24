import { h, render, Component } from 'preact';
import preact from 'preact';

export default class Popup extends Component {
  constructor(props) {
    super(props);
    this.state = {visible:true}
  }

  componentWillReceiveProps(nextProps) {
    // reset the timer if children are changed
    if (nextProps.children !== this.props.children) {
      this.setTimer();
      this.setState({visible: true});
    }
  }

  componentDidMount() {
    this.setTimer();
  }

  setTimer() {
    // clear any existing timer
    if (this._timer != null) {
      clearTimeout(this._timer)
    }

    // hide after `delay` milliseconds
    this._timer = setTimeout(function(){
      this.setState({visible: false});
      this._timer = null;
    }.bind(this), this.props.delay || 5000);
  }

  componentWillUnmount() {
    clearTimeout(this._timer);
  }

  render(props, state) {
    return this.state.visible
      ? <div className={`popup ${this.props.success ? "pop-success" : "pop-error"}`}><p className="alert">{this.props.children}</p></div>
      : <div className={`popup ${this.props.success ? "pop-success" : "pop-error"}`}><p className="alert">{this.props.children}</p></div>;
  }
}