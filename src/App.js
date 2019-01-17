import { h } from 'preact'
import { connect } from 'unistore/preact'

import { actions } from './store/store'
import Helmet from "preact-helmet";
import Nav from "./Nav";

export const App = connect('count', actions)(
    ({ count, increment, decrement }) => (
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
          <p>{count}</p>
          <button className="btn-normal" onClick={increment}>Increment</button>
          <button className="decrement-btn" onClick={decrement}>Decrement</button>
        </div>
      </div>
    )
  )