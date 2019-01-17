import { h } from "preact";
import Nav from './Nav'
import Helmet from "preact-helmet";

export const About = () => (
    <div className="container">
        <Nav/>
        <Helmet
          htmlAttributes={{lang: "en", amp: undefined}} // amp takes no value
          title="All About UnlimitedCouponer and Our Great Deals."
          titleTemplate="UnlimitedCouponer.com - %s"
          defaultTitle="Great Deals and Coupons, all online."
          titleAttributes={{itemprop: "name", lang: "en"}}
        //   base={{target: "_blank", href: "http://mysite.com/"}}
          meta={[
              {name: "description", content: "Helmet application"},
              {property: "og:type", content: "article"}
          ]}
        />
        <h2 className="holder">Our Interactive 12 Week Course Can Teach You The Fundamentials of Web Development and Programming and Land You a Programming Job With No Degree.</h2>
    </div>
);