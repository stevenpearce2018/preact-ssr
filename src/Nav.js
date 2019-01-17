

import { h } from "preact";
import { Link } from "preact-router/match";
 
const Nav = () => (
    <div className="container">
        <h1 className="header">Coupons and deals near you!</h1>
        <nav className="nav">
            <Link href="/" className="logo">UNLIMITEDCOUPONER</Link>
            <div className="mobileNavOptions navOption">☰</div>
            <div className="navOptions">
                <Link href="/" className="navOption">Home</Link>
                <Link href="/about" className="navOption">About</Link>
                <Link href="/search" className="navOption">Search</Link>
                <Link href="/signup" className="navOption">Sign Up</Link>
                <Link href="/login" className="navOption">Login</Link>
                {/* <Link href="/" className="navOption">| &#x1F3E0; Home |</Link>
                <Link href="/about" className="navOption">| &#10067; About |</Link>
                <Link href="/search" className="navOption">| &#x1F50E; Search |</Link>
                <Link href="/signup" className="navOption">| 👥 Sign Up |</Link>
                <Link href="/login" className="navOption">| 👤 Login |</Link> */}
            </div>
            <div className="subNav subNavDesktop">
                <Link href="/food" className="subNavOption">| 🍕 Food |</Link>
                <Link href="/bars" className="subNavOption">| 🍺 Bars |</Link>
                <Link href="/spas" className="subNavOption">| 😌 Spas |</Link>
                <Link href="/gyms" className="subNavOption">| 🏋 Gyms |</Link>
                <Link href="/paintball" className="subNavOption">| 🔫 Paintball |</Link>
                <Link href="/online" className="subNavOption">| 🖥 Online |</Link> 
                <Link href="/any" className="subNavOption">| 🎉 Any |</Link>
            </div>
            <div className="subNav subNavMobile">
                <Link href="/food" className="subNavOption">| 🍕 Food |</Link>
                <Link href="/bars" className="subNavOption">| 🍺 Bars |</Link>
                <Link href="/spas" className="subNavOption">| 😌 Spas |</Link>
                <Link href="/gyms" className="subNavOption">| 🏋 Gyms |</Link>
                <br/>
                <Link href="/paintball" className="subNavOption">| 🔫 Paintball |</Link>
                <Link href="/online" className="subNavOption">| 🖥 Online |</Link> 
                <Link href="/any" className="subNavOption">| 🎉 Any |</Link>
            </div>
        </nav> 
    </div>
);

export default Nav;