import { h } from 'preact'
import capitalizeCase from '../../Lib/capitalizeCase';
import uppcaseFirstWord from '../../Lib/uppcaseFirstWord';
import HaversineInMiles from '../../Lib/HaversineInMiles';
// import postRequest from './postReqest';

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

const CouponsMaker = (props, location) => {
    try {
      const content = props.map((coupons, key) =>
      <div key={key} className="coupon" id={coupons._id}>
      <br/>
      <h2 className = "ctitle marginTop marginBottom">{capitalizeCase(coupons.title)}</h2>
      <img className = "img" src={coupons.base64image} alt={coupons.title}/>
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
        <p>{HaversineInMiles(location.lat, location.long, coupons.latitude, coupons.longitude)}</p>
        <hr/>
        <br/>
        <div className="btnHolder">
          <button className="btn-normal" onClick={ () => getOrDiscardCoupons(coupons._id, updateCouponsClaimed, "discard")}><strong> Discard Coupon </strong></button> 
          <button className="btn-normal" onClick={ () => validateCode(coupons._id, showPopup, coupons.title)}><strong> Validate Customer Codes </strong></button>
        </div>
      </div>
      <br/>
      </div>
      );
      return (
      <div>
        <div className="center">
          <h2 className="holder marginBottom">Coupons Near You</h2>
        </div>
        <div className='couponHolder'>
          {content}
        </div>
      </div>
      );
    } catch (e) {
      return (
        <div className="center">
          <h2 className="holder marginBottom">Did not find any coupons.</h2>
        </div>
      )
    }
  }

export default CouponsMaker;