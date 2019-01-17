import { h } from 'preact'

const Input = props => <input className="input" placeholder={props.placeholder} name={props.name} max={props.max || ''} min={props.min || ''} required={props.required || ''} step={props.step || ''} type={props.type || 'text'} onChange={props.onChange || ''}> </input>;

export const FieldSet = props => <div className="center"><label className="label" htmlFor={props.htmlFor}>{props.label}<Input placeholder={props.placeholder} name={props.name} max={props.max || ''} min={props.min || ''} required={props.required || ''} step={props.step || ''} type={props.type || 'text'} onChange={props.onChange || ''}/></label></div>;
