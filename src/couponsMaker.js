import { h } from 'preact'
import capitalizeCase from './capitalizeCase';
import uppcaseFirstWord from './uppcaseFirstWord';
import HaversineInMiles from './HaversineInMiles';
import postRequest from './postReqest';

// bubble values up to mycoupons component
// const showCode = (code, showPopup, title) => showPopup(code, title);
// const validateCode = (_id, showPopup, title) => showPopup(_id, title);
// const focus = (coupon, focusCoupon) => focusCoupon(coupon);

// const getDistanceFromUser = (latitude, longitude) => {
//   if (navigator && navigator.geolocation) navigator.geolocation.getCurrentPosition(showPosition);
//   else return HaversineInMiles(couponlatitude, couponlongitude, latitude, longitude);
//   function showPosition(location) {
//     return HaversineInMiles(location.coords.latitude, location.coords.longitude, latitude, longitude)
//   }
// }

// const getOrDiscardCoupons = async (_id, updateCouponsClaimed, flag) => {
//   const loggedInKey = sessionStorage.getItem('UnlimitedCouponerKey') ? sessionStorage.getItem('UnlimitedCouponerKey').replace('"', '').replace('"', '') : null;
//   const email = sessionStorage.getItem('UnlimitedCouponerEmail') ? sessionStorage.getItem('UnlimitedCouponerEmail') : null;
//   if (!loggedInKey || !email) {
//     alert('You are not logged in!')
//     window.history.pushState(null, '', decodeURIComponent(`/Login`));
//   }
//   else {
//     const data = {
//       _id: _id,
//       loggedInKey: loggedInKey,
//       email: email
//     }
//     const response = await postRequest(flag === "discard" ? `/api/discardCoupon` : `/api/getCoupon`, data)
//     if (response.response === "Coupon Claimed!" || response.response === "Coupon Removed!") {
//       alert(response.response)
//       const couponsCurrentlyClaimed = flag === "discard" ? Number(sessionStorage.getItem('couponsCurrentlyClaimed')) - 1 : Number(sessionStorage.getItem('couponsCurrentlyClaimed')) + 1; 
//       sessionStorage.setItem('couponsCurrentlyClaimed', couponsCurrentlyClaimed )
//       flag === "discard" ? updateCouponsClaimed(-1) : updateCouponsClaimed(1)
//     }
//     else alert(response.response)
//   }
// }

const CouponsMaker = props => {
    try {
      const content = props.map((coupons, key) =>
      <div key={key} className="coupon" id={coupons._id}>
      <br/>
      <h2 className = "exampleTitle marginTop">{capitalizeCase(coupons.title)}</h2>
      <img className = "exampleImage" src={coupons.base64image} alt={coupons.title}/>
      <div className="pricing">
        <div className='oldPrice'>
            Was: {(coupons.currentPrice - 0).toFixed(2)}$
        </div>
        <div className='percentOff'>
            {(((coupons.currentPrice - coupons.discountedPrice)/coupons.currentPrice)*100).toFixed(2)}% Percent Off!
        </div>
        <br/>
        <div className='newPrice'>
            Now: {(coupons.discountedPrice - 0).toFixed(2) === "0.00" ? "FREE" : (coupons.discountedPrice - 0).toFixed(2) + "$"}
        </div>
        <div className='savings'>
            Save: {(coupons.currentPrice - coupons.discountedPrice).toFixed(2)}$
        </div>
        <br/>
        <hr/>
        <div className="amountLeft">
            Only {coupons.amountCoupons} Coupons Left!
        </div>
      <hr/>
      <div className="description">
      <br/>
        <p>{uppcaseFirstWord(coupons.textarea)}</p>
        <br/>
        <hr/>
        <p>{capitalizeCase(coupons.address)}, {capitalizeCase(coupons.city)}</p>
        <br/>
        {/* <p>{getDistanceFromUser(coupons.latitude, coupons.longitude)}</p> */}
        <hr/>
        <br/>
        <button className="getCoupon redBackground" onClick={ () => getOrDiscardCoupons(coupons._id, updateCouponsClaimed, "discard")}><strong> Discard Coupon </strong></button> 
            <button className="getCoupon" onClick={ () => validateCode(coupons._id, showPopup, coupons.title)}><strong> Validate Customer Codes </strong></button>
      </div>
      <br/>
    </div>
  </div>
      );
      return (
      <div className='flextape'>
        {content}
      </div>
      );
    } catch (error) {
      return (
      <div className='center'>
      <br/>
      {(window.location.href.substring(window.location.href.lastIndexOf('/')+1, window.location.href.lastIndexOf('/')+7).toLowerCase() === "search" ) ?
        <h2>Didn't find any coupons with these parameters.</h2> :
        <h2>Unable to automatically search for coupons. Try searching manually.</h2>
      }
      </div>
      )
    }
  }

export default CouponsMaker;