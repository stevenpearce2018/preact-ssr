const mongoose = require('mongoose');

const accountInfo = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: String,
    password: String,
    yourPick: String,
    loggedInKey: String,
    couponsCurrentlyClaimed: Number,
    couponIds: [String], // mongodb ID
    usedCoupons: [String],
    couponCodes: [{
        _id: String,
        couponCode: String
    }],
})

module.exports = mongoose.model('AccountInfo', accountInfo)