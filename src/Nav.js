

import { h } from "preact";
import { Link } from "preact-router/match";
import { connect } from 'unistore/preact'

import { actions } from './store/store'
 
const Nav = connect(["email", "loggedInKey", "menuActive"], actions)(
    ({ email, loggedInKey, logout, menuActive, toggleMenu }) => (
    <div className="container">
        <h1 className="header">Coupons and deals near you!</h1>
        <h2 className="subHeader">{ email ? `Welcome, ${email}!` : `Welcome, Guest!` }</h2>
        <nav className="nav">
            <Link href="/" className="logo">UNLIMITEDCOUPONER</Link>
            <div className="mobileNavOptions navOption" onClick={toggleMenu}>☰</div>
            <div className="navOptions">
                <Link href="/" className="navOption">Home</Link>
                <Link href="/about" className="navOption">About</Link>
                <Link href="/search" className="navOption">Search</Link>
                { loggedInKey && <Link href="/mycoupons" className="navOption">My Coupons</Link> }
                { loggedInKey && loggedInKey.slice(-1) === 'b' && <Link href="/uploadcoupons" className="navOption">Upload Coupons</Link> }
                { !loggedInKey && <Link href="/signup" className="navOption">Sign Up</Link> } 
                { !loggedInKey ? 
                    <Link href="/login" className="navOption">Login</Link>
                    :
                    <a href="/" className="navOption" onClick={logout}>Logout</a>
                } 

                {/* <Link href="/" className="navOption">| &#x1F3E0; Home |</Link>
                <Link href="/about" className="navOption">| &#10067; About |</Link>
                <Link href="/search" className="navOption">| &#x1F50E; Search |</Link>
                <Link href="/signup" className="navOption">| 👥 Sign Up |</Link>
                <Link href="/login" className="navOption">| 👤 Login |</Link> */}
            </div>
            <div className="subNav subNavDesktop">
                <Link href="/food" className="subNavOption">Food</Link>
                <Link href="/bars" className="subNavOption">Bars</Link>
                <Link href="/spas" className="subNavOption">Spas</Link>
                <Link href="/gyms" className="subNavOption">Gyms</Link>
                <Link href="/paintball" className="subNavOption">Paintball</Link>
                <Link href="/online" className="subNavOption">Online</Link> 
                <Link href="/any" className="subNavOption">Any</Link>
                {/* <Link href="/food" className="subNavOption">| 🍕 Food |</Link>
                <Link href="/bars" className="subNavOption">| 🍺 Bars |</Link>
                <Link href="/spas" className="subNavOption">| 😌 Spas |</Link>
                <Link href="/gyms" className="subNavOption">| 🏋 Gyms |</Link>
                <Link href="/paintball" className="subNavOption">| 🔫 Paintball |</Link>
                <Link href="/online" className="subNavOption">| 🖥 Online |</Link> 
                <Link href="/any" className="subNavOption">| 🎉 Any |</Link> */}
            </div>
            <div className={menuActive ? `subNav subNavMobile` : `none`} onClick={toggleMenu}>
                <Link href="/" className="subNavOptionMobile">Home</Link>
                <Link href="/about" className="subNavOptionMobile">About</Link>
                <Link href="/search" className="subNavOptionMobile">Search</Link>
                { loggedInKey && <Link href="/mycoupons" className="subNavOptionMobile">My Coupons</Link> }
                { loggedInKey && loggedInKey.slice(-1) === 'b' && <Link href="/uploadcoupons" className="subNavOptionMobile">Upload Coupons</Link> }
                { !loggedInKey && <Link href="/signup" className="subNavOptionMobile">Sign Up</Link> } 
                { !loggedInKey ? 
                    <Link href="/login" className="subNavOptionMobile">Login</Link>
                    :
                    <a href="/" className="subNavOptionMobile" onClick={logout}>Logout</a>
                } 
            </div>
        </nav>
    </div>
    )
);

export default Nav;