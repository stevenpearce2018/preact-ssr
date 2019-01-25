const express = require("express");
const { h } = require("preact");
const render = require("preact-render-to-string");
import { Provider } from 'unistore/preact'
import Helmet from 'preact-helmet'
const { App } = require("./src/App");
const path = require("path");
require('dotenv').config()
const app = express();
const bodyParser = require('body-parser');
const minify = require('express-minify');
const compression = require('compression')
const redishelper = require('./redishelper')
const bcrypt = require('bcryptjs');
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const pass = process.env.PASS
const unlimtedcouponerEmail = process.env.EMAIL
const client = require('twilio')(accountSid, authToken);
const Coupon = require('./models/coupons')
const AccountInfo = require('./models/accountInfo')
const mongoose = require('mongoose')
const stripe = require('./stripe');
const nodemailer = require('nodemailer');
const searchableMongoIDs = require("./lib/searchableMongoIDs");
const claimCode = require("./lib/claimCode");
const escapeRegex = require("./lib/escapeRegex");
const validateEmail = require('./lib/validateEmail');
const associateCouponCodeByID = require('./lib/associateCouponCodeByID');
const cleanCoupons = require("./lib/cleanCoupons");
const getIP = require('./lib/getIP');
const checkMembershipDate = require("./lib/checkMembershipDate");
const validateCouponForm = require("./lib/validateCouponForm");
const ObjectId = require('mongodb').ObjectId; 
const useCode = require("./lib/useCode");
const moment = require("moment");
const checkPasswordStrength = require('./lib/checkPasswordStrength');
const fs = require('fs');

const addUrlToSitemapXML = url => {
  const filename = "sitemap.xml"
  fs.readFile(filename, (err, data) => {
    if(err) throw err;
    let theFile = data.toString().split("\n");
    theFile.splice(-1,1);
    fs.writeFile(filename, theFile.join("\n"), err => {
    if(err) return console.log(err);
    });
    fs.appendFile('sitemap.xml', `\n<url>\n<loc>${url}</loc>\n<changefreq>daily</changefreq>\n<priority>0.3</priority>\n</url>\n</urlset>`, (err, contents) => {
    });
  });
}

// const requireHTTPS = (req, res, next) => {
//   // The 'x-forwarded-proto' check is for Heroku
//   if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") return res.redirect('https://' + req.get('host') + req.url);
//   next();
// }
// app.use(requireHTTPS);
app.use(compression());
app.use(minify());
app.use(bodyParser.json({limit:'50mb'}))
app.use(bodyParser.urlencoded({ extended: true, limit:'50mb' }))
app.use('*/sitemap.xml', (req, res) => res.sendFile('sitemap.xml' , { root : __dirname}));
app.use('*/robots.txt', (req, res, next) => {
    res.type('text/plain')
    res.send("# GSM: https://www.unlimitedcouponer.com\nSitemap: https://www.unlimitedcouponer.com/sitemap.xml\nUser-agent: *\nDisallow:");
  });

const head = Helmet.rewind();

import Router from './src/router'
import createStore from './src/store/store' 

const HTMLShell = (html, state) => `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta http-equiv="Content-Type" />
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
            <meta name="theme-color" content="#000000">
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta name="Description" content="Coupons: Discounts at bars and restaurants near you">
            ${head.title.toString()}
            ${head.meta.toString()}
            ${head.link.toString()}
            <link rel="manifest" href="/manifest.json" async defer>
            <link rel="icon" type="image/x-icon" href="/favicon.ico" async defer/>
        </head>
        <body>
            <noscript>
                You need to enable JavaScript to run this app.
            </noscript>
            <div id="app">${html}</div>
            <script>window.__STATE__=${JSON.stringify(state).replace(/<|>/g, '')}</script>
            <script src="./app.js" async></script>
            <script async defer>
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js');
                });
            }
            </script>
            <script src="https://maps.google.com/maps/api/js?key=AIzaSyDSPHIFPEXvdY0sLi9E2fhPzZgeP6Aat2o" async defer></script>
            <script src="https://js.stripe.com/v3/" async defer></script>
        </body>
    </html>`

app.use(express.static(path.join(__dirname, "dist")));

app.get(['/:category?', '/about', 'search', '/signup', '/login', 'accountsettings', 'uploadcoupons'], (req, res) => {
  // !todo, add cookies to persist login state
	const store = createStore({ coupons: undefined, popup: undefined, menuActive: false, loggedInKey: undefined, email: undefined, lat: undefined, long: undefined  })
	const state = store.getState()
	const html = render(
		<Provider store={store}>
			<Router />
		</Provider>
	)
	res.send(HTMLShell(html, state))
})

  // const transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: unlimtedcouponerEmail,
  //     pass: pass
  //   }
  // });
  
  // try {
  //   mongoose.connect(process.env.DB).then(console.log('Connected to mongoDB'));
  // } catch (error) {
  //   console.log(error, "Failed to connect to mongoDB. :(")
  // }
  // const postStripeCharge = res => (stripeErr, stripeRes) => {
  //   if (stripeErr) res.status(500).send({ error: stripeErr });
  //   else res.status(200).send({ success: stripeRes });
  // }

  app.post('/api/charge', async(req, res) => {
    stripe.charges.create(req.body, postStripeCharge(res));
  });
  
  app.post('/api/recoverAccount', async(req, res) => {
    const email = req.body.recoveryEmail;
    // const phoneNumber = req.body.phoneNumber;
    const randomNumber = Math.floor(Math.random()*90000) + 10000;
    if(email) {
      // r = recoverAccount key
      // smaller the redis string better the performance
      redishelper.set("r:"+email, randomNumber, 60*10) // 10 minutes
      const mailOptions = {
        from: "UnlimitedCouponer", // sender address
        to: email, // list of receivers
        subject: 'Recover Account', // Subject line
        html: `<p>Here is your random number ${randomNumber}, it will expire in 10 minutes.</p>
        <p>If you did not request this recovery please email us at unlimtedcouponer@gmail.com</p>`// plain text body
      };
      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) return console.log(error);
      });
      res.send("Email Sent!")
    } else res.status(400).send("Failed to send email.")
  });
  
  app.post('/api/recoverAccountWithCode', async(req, res) => {
    const email = req.body.recoveryEmail.toLowerCase();
    const randomNumber = req.body.randomNumber;
    const newPassword = req.body.newPassword;
    redishelper.get("r:"+email, confirmRandomNumber)
    async function confirmRandomNumber(randomNumberFromRedis) {
      if (randomNumberFromRedis === randomNumber && checkPasswordStrength(newPassword)) { 
        res.send("Account Recovered")
        const result = await AccountInfo.findOne({ 'email': email }) 
        const hashedPass = await bcrypt.hashSync(newPassword, 10);
        await AccountInfo.updateOne(
          { "_id" : result._id }, 
          { "$set" : { password: hashedPass } }, 
          { "upsert" : false } 
        );
      }
      else res.status(400).send("Failed to recover account")
    }
  });
  
  app.post('/api/phoneTest', async (req, res) => {
    const randomNumber = Math.floor(Math.random()*90000) + 10000;
    redishelper.set(req.body.phoneNumber, randomNumber, 60*3) // 3 minutes
    try {
      client.messages
      .create({from: '+13124108678', body: 'Your Security code is: '+randomNumber, to: req.body.phoneNumber})//13124108678
      .then(message => res.json({success:true}))
      .done();
    } catch (error) {
      res.json({success:false})
    }
  })
  
  app.post('/api/phoneTestValidateNumber', async (req, res) => {
    redishelper.get(req.body.phoneNumber, compareRandomNumber) // 3 minutes
    function compareRandomNumber(randomNumber){
      if (randomNumber === Number(req.body.randomNumber)) res.json({success:true})
      else res.json({success:false})
    }
  })
  
  app.post('/api/signup', async(req, res) => {
    // redishelper.get(req.body.phoneNumber, compareRandomNumber)
    // async function compareRandomNumber(randomNumber){
    //   if (randomNumber && randomNumber === req.body.randomNumber) {
        const yourPick = req.body.yourPick;
        const password = req.body.password;
        const loggedInKey = yourPick === ' Business Owner' ? Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + ":b" : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + ":c";
        const result = await AccountInfo.find({ 'email': req.body.email })
          if (result.length === 0) {
            if (req.body && req.body.email && validateEmail(req.body.email) && password && checkPasswordStrength(password) && yourPick) {
              if (yourPick === ' Business Owner' || yourPick === ' Customer' /* && req.body.membershipExperationDate */) {
                const hashedPass = await bcrypt.hashSync(password, 10);
                const email = req.body.email.toLowerCase();
                // let today = new Date();
                // let dd = today.getDate();
                // let mm = today.getMonth()+1; //January is 0!
                // const yyyy = today.getFullYear();
                // if(dd<10) dd = '0'+dd
                // if(mm<10) mm = '0'+mm
                // today = yyyy + '-' + mm + '-' + dd;
                // const finalDate = req.body.numberOfMonths && req.body.numberOfMonths > 0 ? moment(today).add(req.body.numberOfMonths, 'months') : "N/A";
                // const membershipExperationDate = yourPick === ' Business Owner' ? "N/A" : JSON.stringify(finalDate).substring(1, 11);
                const registerUser = async() => {
                  const accountInfo = new AccountInfo({
                    _id: new mongoose.Types.ObjectId(),
                    email: email,
                    password: hashedPass,
                    yourPick: yourPick,
                    loggedInKey: loggedInKey,
                    couponIds: [],
                    couponsCurrentlyClaimed: 0,
                    usedCoupons:[],
                    couponCodes:[],
                    ip: ip
                  })
                  await accountInfo.save().catch(err => console.log(err))
                  res.json({
                    loggedInKey:loggedInKey,
                    couponsCurrentlyClaimed: 0
                    // membershipExperationDate: "01-01-2018",
                    // membershipExperationDate: membershipExperationDate,
                  });
                }
                // if(yourPick === ' Customer') {
                //   const chargeData = {
                //     description: req.body.description,
                //     source: req.body.source,
                //     currency: req.body.currency,
                //     amount: req.body.amount
                //   }
                //   const charge = (chargeData.amount / 99 === req.body.numberOfMonths) ? await stripe.charges.create(chargeData) : res.json({resp:'Failed to charge card!'});
                //   if(charge && charge.outcome && charge.outcome.type === "authorized" &&  charge.outcome.network_status === "approved_by_network") registerUser()
                //   else res.json({resp:'Failed to charge card!'});
                // } 
                // else if(yourPick === ' Business Owner') registerUser()
                registerUser()
                // else res.json({resp:'You need to select if you are a Business Owner or a customer!'});
              } else res.status(400).send('You need to select if you are a Business Owner or a customer!');
          } else res.status(400).send('You need to fill out all fields!');
        } else res.status(400).send('Email address is taken!');
    //   } else res.json({resp:'Wrong number, please try again!'});
    // }
  });
  
  app.post('/api/phoneTest', async (req, res) => {
    const randomNumber = Math.floor(Math.random()*90000) + 10000;
    redishelper.set(req.body.phoneNumber, randomNumber, 60*15) // 15 minutes
    try {
      client.messages//+13124108678
      .create({from: '+13124108678', body: 'Your Security code is: '+randomNumber, to: req.body.phoneNumber})
      .then(message => res.json({success:true}))
      .done();
    } catch (error) {
      res.json({success:false})
    }
  })
  
  app.post('/api/phoneTestValidateNumber', async (req, res) => {
    redishelper.get(req.body.phoneNumber, compareRandomNumber) // 3 minutes
    function compareRandomNumber(randomNumber){
      if (randomNumber === Number(req.body.randomNumber)) res.json({success:true})
      else res.json({success:false})
    }
  })
  
  app.post('/api/updateAccount', async (req, res) => {
    const email = req.body.email.toLowerCase();
    const loggedInKey = req.body.loggedInKey;
    const outcome = await AccountInfo.find({'email' : email}).limit(1)
    if (outcome.length === 1 && bcrypt.compareSync(loggedInKey, outcome[0].loggedInKey)) {
      if (req.body.oldPassword !== req.body.newPassword) {
        if(bcrypt.compareSync(req.body.oldPassword, outcome[0].password)) {
          res.send( "Updated Account!")
          const hashedPass = await bcrypt.hashSync(req.body.newPassword, 10);
          await AccountInfo.updateOne(
            { "_id" : outcome[0]._id }, 
            { "$set" : { password: hashedPass } }, 
            { "upsert" : false } 
          );
        } else res.status(400).send("Failed To Update Password")
      }
    } else res.status(400).send("Failed to update")
  });
  
  // Stored failed logins by ip address
  let failures = {};
  const MINS10 = 600000, MINS30 = 3 * MINS10;
  setInterval(() => {
    for (var ip in failures) if (Date.now() - failures[ip].nextTry > MINS10) delete failures[ip];
  }, MINS30);
  
  app.post('/api/signin', async (req, res) => {
    // !todo, add cookies to persist login state
    const remoteIp = getIP(req)
    const onLoginFail = () => {
      let f = failures[remoteIp] = failures[remoteIp] || {count: 0, nextTry: new Date()};
      ++f.count;
      f.nextTry.setTime(Date.now() + 2000 * f.count); // Wait another two seconds for every failed attempt
    }
    const onLoginSuccess = () => delete failures[remoteIp];
    const email = req.body ? req.body.email.toLowerCase() : undefined;
    const outcome = await AccountInfo.find({'email' : email}).limit(1)
    if(outcome[0] && bcrypt.compareSync(req.body.password, outcome[0].password)) {
      const loginStringBase = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const loggedInKey = outcome[0].yourPick === " Customer" ? loginStringBase + ":c" : loginStringBase + ":b";
      outcome[0].yourPick === " Customer" ? res.json({loggedInKey: loggedInKey, couponsCurrentlyClaimed: outcome[0].couponsCurrentlyClaimed}) : res.json({loggedInKey: loggedInKey});
      onLoginSuccess()
      const hashedKey = await bcrypt.hashSync(loggedInKey, 10);
      await AccountInfo.updateOne(
        { "_id" : outcome[0]._id }, 
        { "$set" : { "ip" : req.connection.remoteAddress.replace('::ffff:', '')}, loggedInKey:hashedKey }, 
        { "upsert" : false } 
      );
    } else {
      onLoginFail()
      res.status(400).send("Invalid login");
    }
  });
  
  app.post(`/api/signout`, async(req, res) => {
    const email = req.body.email.toLowerCase();
    const loggedInKey = req.body.loggedInKey;
    // const ip = getIP(req)
    const outcome = await AccountInfo.find({'email' : email}).limit(1)
    if (outcome.length === 1 && bcrypt.compareSync(loggedInKey, outcome[0].loggedInKey)) {
      res.send("Logout Successful")
      const loginStringBase = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const dummyKey = outcome[0].yourPick === " Customer" ? loginStringBase + ":c" : loginStringBase + ":b";
      const hashedDummyKey = await bcrypt.hashSync(dummyKey, 10);
      await AccountInfo.updateOne(
        { "_id" : outcome[0]._id }, 
        { "$set" : { "ip" : hashedDummyKey}, loggedInKey:hashedDummyKey }, 
        { "upsert" : false } 
      );
    } else res.status(400).send("Logout Failed")
  })
  
  app.post(`/api/uploadCoupons`, async(req, res) => {
    const loggedInKey = req.body.loggedInKey;
    const outcome = await AccountInfo.find({'email':req.body.email }).limit(1)
    if(req.body.superCoupon !== "Let's go super" && req.body.superCoupon !== "No thanks") res.json({response: "Please choose your coupon type!"});
    else if(bcrypt.compareSync(loggedInKey, outcome[0].loggedInKey)) {
      if(validateCouponForm(req.body).valid !== false) {
        const chargeData = {
          description: req.body.description,
          source: req.body.source,
          currency: req.body.currency,
          amount: req.body.amount
        }
        let charge;
        // if (req.body.superCoupon === "Let's go super" && chargeData && chargeData.amount && chargeData.amount.toFixed(0) / 25 === req.body.amountCoupons || chargeData.amount.toFixed(0) / 10 === req.body.amountCoupons) charge = await stripe.charges.create(chargeData);
        if (req.body.superCoupon === "Let's go super" && chargeData && chargeData.amount && chargeData.amount.toFixed(0) / 10 === req.body.amountCoupons) charge = await stripe.charges.create(chargeData);
        if(req.body.superCoupon === "Let's go super" && charge && charge.outcome && charge.outcome.type === "authorized" &&  charge.outcome.network_status === "approved_by_network") {
          // /coupons/city/title/id
          res.json({response: 'Coupon Created'})
          const amountCoupons = req.body.amountCoupons;
          let couponCodes = [];
          let i = 0
          for(; i < amountCoupons; i++) couponCodes.push(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)+':a');
          const saveCoupon = async () => {
            const mongodbID = new mongoose.Types.ObjectId();
            addUrlToSitemapXML(`https://www.unlimitedcouponer.com/coupons/${encodeURI(req.body.city).replace(/%20/g, "-")}/${encodeURI(req.body.title).replace(/%20/g, "-")}/${mongodbID}`)
            const coupon = new Coupon({
              _id: mongodbID,
              title: req.body.title,
              address: req.body.address,
              city: req.body.city.toLowerCase(),
              amountCoupons: amountCoupons,
              currentPrice: req.body.currentPrice,
              discountedPrice: req.body.discountedPrice,
              category: req.body.category,
              textarea: req.body.textarea,
              base64image: req.body.imagePreviewUrl,
              superCoupon: req.body.superCoupon,
              couponCodes: couponCodes,
              couponStillValid: true,
              latitude: req.body.latitude,
              longitude: req.body.longitude,
              loc: { 
                type: "Point",
                coordinates: [req.body.longitude, req.body.latitude]
              }
            })
            const arr = [...outcome[0].couponIds, mongodbID]
            await AccountInfo.updateOne(
              { "_id" : outcome[0]._id }, 
              { "$set" : {"couponIds": arr}}, 
              { "upsert" : false } 
            );
            await coupon.save()
              .catch(err => console.log(err))
          }
          saveCoupon();
        } else if (req.body.superCoupon === "No thanks") {
          res.send('Coupon Created')
          const amountCoupons = req.body.amountCoupons;
          let couponCodes = [];
          let i = 0
          for(; i < amountCoupons; i++) couponCodes.push(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)+':a');
          const saveCoupon = async () => {
            const mongodbID = new mongoose.Types.ObjectId();
            const coupon = new Coupon({
              _id: mongodbID,
              title: req.body.title,
              address: req.body.address,
              city: req.body.city.toLowerCase(),
              amountCoupons: amountCoupons,
              currentPrice: req.body.currentPrice,
              discountedPrice: req.body.discountedPrice,
              category: req.body.category,
              textarea: req.body.textarea,
              base64image: req.body.imagePreviewUrl,
              superCoupon: req.body.superCoupon,
              couponCodes: couponCodes,
              couponStillValid: true,
              latitude: req.body.latitude,
              longitude: req.body.longitude,
              loc: { 
                type: "Point",
                coordinates: [req.body.longitude, req.body.latitude]
              }
            })
            const arr = [...outcome[0].couponIds, mongodbID]
            await AccountInfo.updateOne(
              { "_id" : outcome[0]._id }, 
              { "$set" : {"couponIds": arr}}, 
              { "upsert" : false } 
            );
            await coupon.save()
              .catch(err => console.log(err))
          }
          saveCoupon();
        }
        else res.status(400).send('Failed to charge the card provided, coupon was not created.')
      } else res.status(400).send(validateCouponForm(req.body).errorMessage)
    } else res.status(400).send("You are not logged in!");
  })
  
  app.post(`/api/uploadGrouponCoupon`, async(req, res) => {
    if(req && req.body && req.body.superCoupon !== "Let's go super" && req.body.superCoupon !== "No thanks") res.json({response: "Please choose your coupon type!"});
    else if(req && req.body && process.env.SECRETKEY === req.body.key) {
      if(validateCouponForm(req.body).valid !== false) {
        if (req.body.superCoupon === "No thanks") {
          res.send('Coupon Created')
          const amountCoupons = req.body.amountCoupons;
          let couponCodes = [];
          let i = 0
          for(; i < amountCoupons; i++) couponCodes.push(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)+':a');
          const saveCoupon = async () => {
            const mongodbID = new mongoose.Types.ObjectId();
            const coupon = new Coupon({
              _id: mongodbID,
              title: req.body.title,
              address: req.body.address,
              city: req.body.city.toLowerCase(),
              amountCoupons: amountCoupons,
              currentPrice: req.body.currentPrice,
              discountedPrice: req.body.discountedPrice,
              category: req.body.category,
              textarea: req.body.textarea,
              base64image: req.body.imagePreviewUrl,
              superCoupon: req.body.superCoupon,
              couponCodes: couponCodes,
              couponStillValid: true,
              latitude: req.body.latitude,
              longitude: req.body.longitude,
              loc: { 
                type: "Point",
                coordinates: [req.body.longitude, req.body.latitude]
              }
            })
            const arr = [...outcome[0].couponIds, mongodbID]
            await AccountInfo.updateOne(
              { "_id" : outcome[0]._id }, 
              { "$set" : {"couponIds": arr}}, 
              { "upsert" : false } 
            );
            await coupon.save()
              .catch(err => console.log(err))
          }
          saveCoupon();
        }
        else res.status(400).send('Failed to charge the card provided, coupon was not created.')
      } else res.status(400).send(validateCouponForm(req.body).errorMessage)
    } else res.status(400).send("Wrong Key!");
  })
  
  app.get('/api/geoCoupons/:long/:lat/:pageNumber', async (req, res) => {
    const long = (req && req.params && req.params.long) ? req.params.long.toLowerCase().replace(/\"/g,"") : res.json({ coupons: data });
    const lat = (req && req.params && req.params.lat) ? req.params.lat.toLowerCase().replace(/\"/g,"") : res.json({ coupons: "Could Not Find your locaton" });
    const pageNumber = req.params.pageNumber;
    let coupons = await Coupon.find({
      superCoupon: "Let's go super",
      couponStillValid: true,
      'loc.coordinates': {
        $geoWithin: {
          $center: [[long, lat], 10000]
        },
      },
    }).skip((pageNumber-1)*20).limit(20)
    if (coupons.length === 0 ) {
      coupons = await Coupon.find({
        superCoupon: "No thanks",
        couponStillValid: true,
        'loc.coordinates': {
          $geoWithin: {
            $center: [[long, lat], 10000]
          },
        },
      }).skip((pageNumber-1)*20).limit(20)
    } else if (coupons.length < 20 ) {
      const extraCoupons = await Coupon.find({
        superCoupon: "No thanks",
        couponStillValid: true,
        'loc.coordinates': {
          $geoWithin: {
            $center: [[long, lat], 10000]
          },
        },
      }).skip((pageNumber-1)*20).limit(20 - coupons.length)
      if (extraCoupons.length > 0) coupons = [...extraCoupons, ...coupons];
    }
    res.send(cleanCoupons(coupons));
  })
  
  // Not supported anymore
  app.get('/api/getSponseredCoupons/:city/:pageNumber', async (req, res) => {
    let coupons;
    const cityUserIsIn = req.params.city.toLowerCase().replace(/\"/g,"");
    const pageNumber = req.params.pageNumber;
    redishelper.get(`${cityUserIsIn}/${pageNumber}`, getCachedCoupons)
    async function getCachedCoupons (data) {
      if(!data) {
        if(cityUserIsIn) {
          coupons = await Coupon.find({city : cityUserIsIn, superCoupon: "Let's go super", couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length > 0 ) res.send(cleanCoupons(coupons));
          else {
            coupons = await Coupon.find({city : cityUserIsIn, superCoupon: "No Thanks", couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
            if (coupons.length > 0 ) res.send(cleanCoupons(coupons));
            else res.status(400).send('No coupons were found near you. Try searching manually'); 
          }
          redishelper.set(`${cityUserIsIn}/${pageNumber}`, cleanCoupons(coupons), 60*1)
        }
        else {
          coupons = await Coupon.find({superCoupon: "Let's go super", couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length > 0 ) res.send(cleanCoupons(coupons));
          else {
            coupons = await Coupon.find({superCoupon: "No Thanks", couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
            if (coupons.length > 0 ) res.send(cleanCoupons(coupons));
            else res.status(400).send('No coupons were found near you. Try searching manually');
          }
          redishelper.set(`${cityUserIsIn}/${pageNumber}`, cleanCoupons(coupons), 60*1)
        }
      } else if (data.length === 0) res.status(400).send('No coupons were found near you. Try searching manually');
      else res.send(data);
    }
  });
  
  app.get('/api/getGeoCoupons/:long/:lat/:pageNumber', async (req, res) => {
    let coupons;
    const long = (req && req.params && req.params.long) ? req.params.long.toLowerCase().replace(/\"/g,"") : res.send( data);
    const lat = (req && req.params && req.params.lat) ? req.params.lat.toLowerCase().replace(/\"/g,"") : res.status(400).send("Could Not Find your locaton");
    const pageNumber = req.params.pageNumber;
    redishelper.get(`${long}/${lat}/${pageNumber}`, getCachedCoupons)
    async function getCachedCoupons (data) {
      if(!data) {
        if(long && lat && pageNumber) {
          coupons = await Coupon.find({city : cityUserIsIn, superCoupon: "Let's go super", couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length > 0 ) res.send(cleanCoupons(coupons));
          else {
            coupons = await Coupon.find({city : cityUserIsIn, superCoupon: "No Thanks", couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
            if (coupons.length > 0 ) res.send(cleanCoupons(coupons));
            else res.status(400).send('No coupons were found near you. Try searching manually'); 
          }
          redishelper.set(`${cityUserIsIn}/${pageNumber}`, cleanCoupons(coupons), 60*1)
        }
        else {
          coupons = await Coupon.find({superCoupon: "Let's go super", couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length > 0 ) res.send(cleanCoupons(coupons));
          else {
            coupons = await Coupon.find({superCoupon: "No Thanks", couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
            if (coupons.length > 0 ) res.send(cleanCoupons(coupons));
            else res.status(400).send('No coupons were found near you. Try searching manually');
          }
          redishelper.set(`${cityUserIsIn}/${pageNumber}`, cleanCoupons(coupons), 60*1)
        }
      } else if (data.length === 0) res.status(400).send('No coupons were found near you. Try searching manually');
      else res.send(data);
    }
  });
  
  app.post('/api/getYourCoupons', async (req, res) => {
    // const ip = getIP(req)
    const loggedInKey = req.body.loggedInKey;
    const email = req.body.email;
    redishelper.get("gyc" + email, gotData)
    async function gotData (data) {
      if(!data) {
        const outcome = await AccountInfo.find({'email':email}).limit(1);
        if(bcrypt.compareSync(loggedInKey, outcome[0].loggedInKey)) {
          const searchIDS = searchableMongoIDs(outcome[0].couponIds)
          let coupons;
          coupons = await Coupon.find({'_id': { $in: searchIDS}})
          coupons.length === 0 ? coupons = "No coupons found." : coupons = associateCouponCodeByID(outcome[0].couponCodes, coupons)
          res.send(coupons);
          redishelper.set("gyc" + email, coupons, 60*1)
        }
        else if (outcome[0] && outcome[0].couponCodes.length === 0) res.status(400).send("You are not logged in!");
        else res.status(400).send("No coupons found.");
      } else res.send(data);
    }
  });
  
  app.get('/api/deals/:id', async (req, res) => {
    // const ip = getIP(req)
    const id = req.params.id;
    redishelper.get(`d${id}`, gotCoupon)
    async function gotCoupon(coupon) {
      if(coupon) res.status(400).send(data)
      else {
        let coupons;
        coupons = await Coupon.find({'_id': id })
        coupons.length === 0 ? coupons = "No coupons found." : coupons;
        res.status(coupons === "No coupons found." ? 400 : 200).send(coupons);
        redishelper.set(`d${id}`, cleanCoupons(coupon), 60*1)
      }
    }
  });
  
  app.post('/api/addMonths', async (req, res) => {
    // const ip = getIP(req)
    const loggedInKey = req.body.loggedInKey;
    const email = req.body.email;
    const numberOfMonths = req.body.numberOfMonths;
    const chargeData = {
      description: req.body.description,
      source: req.body.source,
      currency: req.body.currency,
      amount: req.body.amount
    }
    const outcome = await AccountInfo.find({'email':email}).limit(1);
    if(outcome[0].length === 1 && req.body.numberOfMonths >= 1 && bcrypt.compareSync(loggedInKey, outcome[0].loggedInKey)) {
      const charge = (chargeData.amount / 99 === numberOfMonths) ? await stripe.charges.create(chargeData) : res.json({resp:'Failed to charge card!'});
      if(charge && charge.outcome && charge.outcome.type === "authorized" &&  charge.outcome.network_status === "approved_by_network") {
        let today = new Date();
        let dd = today.getDate();
        let mm = today.getMonth()+1; //January is 0!
        const yyyy = today.getFullYear();
        if(dd<10) dd = '0'+dd
        if(mm<10) mm = '0'+mm
        today = yyyy + '-' + mm + '-' + dd;
        // if membership is valid, start addming months from that date. Otherwise add from today
        const date = outcome[0].membershipExperationDate
        const startingDate = checkMembershipDate(date) ? date : today;
        const finalDate = moment(startingDate).add(numberOfMonths, 'months');
        const cleanedDate = JSON.stringify(finalDate).substring(1, 11)
        res.json({response:`Added ${numberOfMonths} month(s) worth of membership. Thank you for your support!`, cleanedDate: cleanedDate})
        await AccountInfo.updateOne(
          { "_id" : outcome[0]._id }, 
          { "$set" : { "membershipExperationDate": cleanedDate}}, 
          { "upsert" : false } 
        );
      }
    } else res.status(400).send("Failed to add months.")
  })
  
  app.post('/api/validateCode', async (req, res) => {
    const couponCode = req.body.couponCode;
    const couponID = new ObjectId(req.body.id);
    const coupon = await Coupon.find({'_id': couponID}).limit(1);
    const account = await AccountInfo.find({'email':req.body.email}).limit(1)
    if (coupon.length === 0) res.json({response: "Coupon is not valid."})
    else if(account.length === 0) res.json({response: "Email is not valid."})
    else {
      const confirmCodeLinkedToAccount = (couponCode, couponCodes) => {
        if (couponCode.slice(-1) === "u") return false;
        let i = 0;
        const couponCodesLength = couponCodes.length;
        for (; i < couponCodesLength; i++ ) if(couponCodes[i].couponCode === couponCode) return true;
        return false;
      }
      const codeLinkedToEmail = confirmCodeLinkedToAccount(couponCode, account[0].couponCodes)
      const confirmValidCouponCode = (couponCode, couponCodes) => {
        if (couponCode.slice(-1) === "u") return false;
        let i = 0;
        const couponCodesLength = couponCodes.length;
        for (; i < couponCodesLength; i++ ) if(couponCodes[i] === couponCode) return true;
        return false;
      }
      const isValidCouponCode = confirmValidCouponCode(couponCode, coupon[0].couponCodes)
      isValidCouponCode && codeLinkedToEmail ? res.send("Coupon is valid!") : res.status(400).send( "Coupon is not valid.");
      if (isValidCouponCode && codeLinkedToEmail) {
        const arrCouponCodes = useCode(couponCode, account[0].couponCodes)
        const couponsCurrentlyClaimed = account[0].couponsCurrentlyClaimed >= 0 ? Number(account[0].couponsCurrentlyClaimed) - 1 : 0;
        await AccountInfo.updateOne(
          { "_id" : account[0]._id }, 
          { "$set" : { 
            "couponsCurrentlyClaimed": couponsCurrentlyClaimed }, //
            "couponCodes": arrCouponCodes
          }, 
          { "upsert" : false } 
        );
      }
    }
  })
  
  app.get('/search', async (req, res) => {
    // Goodluck!
    let coupons;
    const city = (req.query.city) ? req.query.city.toLowerCase() : null;
    const zip = (req.query.zip) ? req.query.zip : null;
    const category = (req.query.category) ? req.query.category : null;
    const keyword = (req.query.keywords) ? req.query.keywords : null;
    const regex = (keyword) ? new RegExp(escapeRegex(keyword), 'gi') : null;
    const pageNumber = req.query.pageNumber;
    if(city && zip && category && keyword) {
      redishelper.get(`${city}/${zip}/${keyword}`, getCachedCouponsAll)
      async function getCachedCouponsAll (data) {
        if(!data) {
          coupons = await Coupon.find({'city' : city, 'zip' : zip, 'category' : category, "textarea": regex, couponStillValid: true})
          if (coupons.length === 0) coupons = await Coupon.find({'city' : city, 'zip' : zip, 'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'city' : city, 'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'city' : city, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          res.send(cleanCoupons(coupons));
          redishelper.set(`${city}/${zip}/${keyword}/${pageNumber}`, cleanCoupons(coupons), 60*1)
        }
        else return res.json({coupons: data});
      }
    }
    else if(city && zip) {
      redishelper.get(`${city}/${zip}/${pageNumber}`, getCachedCouponsCityZip)
      async function getCachedCouponsCityZip (data) {
        if(!data) {
          coupons = await Coupon.find({'city' : city, 'zip' : zip, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'city' : city, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = "No coupons found."
          res.send(cleanCoupons(coupons));
          redishelper.set(`${city}/${zip}/${pageNumber}`, cleanCoupons(coupons), 60*1)
        }
        else return res.send(data);
      }
    }
    else if(keyword && zip) {
      redishelper.get(`${keyword}/${zip}/${pageNumber}`, getCachedCouponsKeywordZip)
      async function getCachedCouponsKeywordZip (data) {
        if(!data) {
          coupons = await Coupon.find({'zip' : city, 'textarea' : keyword, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'zip' : zip, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'textarea' : keyword, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = "No coupons found."
          res.send(cleanCoupons(coupons));
          redishelper.set(`${keyword}/${zip}/${pageNumber}`, cleanCoupons(coupons), 60*1)
        }
        else return res.send(data);
      }
    }
    else if(city && category) {
      redishelper.get(`${city}/${category}/${pageNumber}`, getCachedCouponsCityCategory)
      async function getCachedCouponsCityCategory(data) {
        if(!data) {
          coupons = await Coupon.find({'city' : city, 'category' : category, couponStillValid: true})
          if (coupons.length === 0) coupons = await Coupon.find({'city' : city, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = "No coupons found."
          res.send(cleanCoupons(coupons));
          redishelper.set(`${city}/${category}/${pageNumber}`, cleanCoupons(coupons), 60*1);
        }
        else return res.send(data);
      }
    }
    else if(city && keyword) {
      redishelper.get(`${city}/${keyword}/${pageNumber}`, getCachedCouponsCityKeyword)
      async function getCachedCouponsCityKeyword (data) {
        if(!data) {
          coupons = await Coupon.find({'city' : city, 'textarea' : keyword, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'city' : city, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'textarea' : keyword, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = "No coupons found."
          res.send(cleanCoupons(coupons));
          redishelper.set(`${city}/${keyword}/${pageNumber}`, cleanCoupons(coupons), 60*1);
        }
        else return res.send(data);
      }
    }
    else if(category && zip) {
      redishelper.get(`${category}/${zip}/${pageNumber}`, getCachedCouponsCategoryZip)
      async function getCachedCouponsCategoryZip (data) {
        if(!data) {
          coupons = await Coupon.find({'zip' : zip, 'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'zip' : zip, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = "No coupons found."
          res.send(cleanCoupons(coupons));
          redishelper.set(`${category}/${zip}/${pageNumber}`, cleanCoupons(coupons), 60*1);
        }
        else return res.send(data);
      }
    }
    else if(category && keyword) {
      redishelper.get(`${category}/${keyword}/${pageNumber}`, getCachedCouponsCategoryKeyword)
      async function getCachedCouponsCategoryKeyword (data) {
        if(!data) {
          coupons = await Coupon.find({'zip' : zip, 'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'textarea' : keyword, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = "No coupons found."
          res.send(cleanCoupons(coupons));
          redishelper.set(`${category}/${keyword}/${pageNumber}`, cleanCoupons(coupons), 60*1);
        }
        else return res.send(data);
      }
    }
    else if(category && city) {
      redishelper.get(`${category}/${city}/${pageNumber}`, getCachedCouponsCategoryCity)
      async function getCachedCouponsCategoryCity (data) {
        if(!data) {
          coupons = await Coupon.find({'city' : city, 'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'city' : city, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = "No coupons found."
          res.send(cleanCoupons(coupons));
          redishelper.set(`${category}/${city}/${pageNumber}`, cleanCoupons(coupons), 60*1);
        }
        else return res.send(data);
      }
    }
    else if(category) {
      redishelper.get(`category:${category}/${pageNumber}`, getCachedCouponsCategory)
      async function getCachedCouponsCategory (data) {
        if(!data) {
          coupons = await Coupon.find({'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = "No coupons found."
          res.send(cleanCoupons(coupons));
          redishelper.set(`category:${category}/${pageNumber}`, cleanCoupons(coupons), 60*1);
        }
        else return res.send(data);
      }
    }
    else if(city) {
      redishelper.get(`city:${city}/${pageNumber}`, getCachedCouponsCity)
      async function getCachedCouponsCity (data) {
        if(!data) {
          coupons = await Coupon.find({'city' : city, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = "No coupons found."
          res.send(cleanCoupons(coupons));
          redishelper.set(`city:${city}/${pageNumber}`, cleanCoupons(coupons), 60*1);
        }
        else return res.send(data);
      }
    }
    else if(zip) {
      redishelper.get(`zip:${zip}/${pageNumber}`, getCachedCouponsZip)
      async function getCachedCouponsZip (data) {
        if(!data) {
          coupons = await Coupon.find({'zip' : zip, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = "No coupons found."
          res.send(cleanCoupons(coupons));
          redishelper.set(`zip:${zip}/${pageNumber}`, cleanCoupons(coupons), 60*1);
        }
        else return res.send(data);
      }
    }
    else if(keyword) {
      redishelper.get(`keyword:${keyword}/${pageNumber}`, getCachedCouponsKeyword)
      async function getCachedCouponsKeyword (data) {
        if(!data) {
          coupons = await Coupon.find({'textarea' : regex, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = "No coupons found."
          res.send(cleanCoupons(coupons));
          redishelper.set(`keyword:${keyword}/${pageNumber}`, cleanCoupons(coupons), 60*1);
        }
        else return res.send(data);
      }
    }
  });
  
  app.post(`/api/getCoupon`, async(req, res) => {
    const loggedInKey = req.body.loggedInKey;
    // if (!loggedInKey) res.json({response: "You need to be logged in and have a valid subscription in order to claim coupons!"});
    if (!loggedInKey) res.status(400).send("You need to be logged in order to claim coupons!");
    else {
      const _id = req.body._id;
      // const ip = getIP(req)
      const outcome = await AccountInfo.find({'email':req.body.email }).limit(1)
      if (outcome) {
        if (outcome[0].yourPick !== ' Customer') res.status(400).send("Only customers can claim coupons!");
        else if(/* checkMembershipDate(outcome[0].membershipExperationDate) && */ bcrypt.compareSync(loggedInKey, outcome[0].loggedInKey)) {
          if (outcome[0].couponsCurrentlyClaimed < 5) {
            const isClaimed = (ids, id) => {
              let i = 0;
              const iMax = ids.length;
              for (; i < iMax; i++) if(ids[i] === id) return true;
              return false;
            }
            const claimedAlready = isClaimed(outcome[0].couponIds, _id);
            if (claimedAlready) res.status(400).send("Coupon Already Claimed!");
            else {
              const coupon = await Coupon.find({'_id':_id }).limit(1);
              let couponCode;
              let couponStillValid = true;
              let i = 0;
              const iMax = coupon[0].couponCodes.length;
              for (;i < iMax; i++) {
                if(coupon[0].couponCodes[i].substr(-1) === "a") {
                  couponCode = coupon[0].couponCodes[i].substring(0, coupon[0].couponCodes[i].length - 1) + "c";
                  break;
                }
              }
              if (coupon[0].amountCoupons - 1 <= 0) couponStillValid = false;
              const arrIds = [...outcome[0].couponIds, _id];
              const arrCouponCodes = [...outcome[0].couponCodes, {_id: _id, couponCode: couponCode}]
              if(couponCode) {
                redishelper.set("gyc" + req.body.email, null)
                res.send("Coupon Claimed!");
                await AccountInfo.updateOne(
                  { "_id" : outcome[0]._id }, 
                  { "$set" : { 
                    "couponIds": arrIds}, //
                    "couponsCurrentlyClaimed": outcome[0].couponsCurrentlyClaimed + 1 ,
                    "couponCodes": arrCouponCodes
                  }, 
                  { "upsert" : false } 
                );
                const updatedCodes = claimCode(coupon[0].couponCodes)
                await Coupon.updateOne(
                  { "_id" : req.body._id },
                  { "$set" : { 
                    "couponCodes": updatedCodes},
                    "amountCoupons": (coupon[0].amountCoupons - 1),
                    "couponStillValid": couponStillValid
                  }, 
                  { "upsert" : false } 
                );
              } else res.status(400).send("These coupons are no longer available. Please try another coupon.");
            }
          } else res.status(400).send("You have too many coupons! Please use or discard one of your current coupons.");
        // } else res.json({response: "Your membership has expired! Please renew it under the account settings option."});
      } else res.status(400).send("Your login credentials appear to be incorrect, please try again.");
      } else res.status(400).send("You need to be logged in and have a valid subscription in order to claim coupons!");
    }
  })
  
  app.post(`/api/discardCoupon`, async(req, res) => {
    const loggedInKey = req.body.loggedInKey;
    if (!loggedInKey) res.status(400).send("You need to be logged in to discard coupons!");
    else {
      const _id = req.body._id;
      // const ip = getIP(req)
      const outcome = await AccountInfo.find({'email':req.body.email}).limit(1)
      if (outcome && bcrypt.compareSync(loggedInKey, outcome[0].loggedInKey)) {
        if (outcome[0].yourPick !== ' Customer') res.status(200).send("Something went wrong!");
        // if (outcome[0].couponsCurrentlyClaimed === 0) {
            const coupon = await Coupon.find({'_id':_id }).limit(1);
            const filtherID = (IDS, ID) => {
              let i = 0;
              const iMax = IDS.length;
              let cleanedIDS = []
              for (; i < iMax; i++) if (IDS[i] !== ID) cleanedIDS.push(IDS[i]);
              return cleanedIDS;
            }
            const arrIds = filtherID(outcome[0].couponIds, _id);
            const filtherCouponCodes = (couponCodes, ID) => {
              let i = 0;
              const iMax = couponCodes.length;
              let cleanedIDS = []
              for (; i < iMax; i++) if (couponCodes[i]._id !== ID) cleanedIDS.push(couponCodes[i]);
              return cleanedIDS;
            }
            const filtherCouponCode = (couponCodes, ID) => {
              let i = 0;
              const iMax = couponCodes.length;
              for (; i < iMax; i++) if (couponCodes[i]._id === ID) return couponCodes[i].couponCode;
            }
            const arrCouponCodes = filtherCouponCodes(outcome[0].couponCodes, _id);
            const couponCode = filtherCouponCode(outcome[0].couponCodes, _id);
            redishelper.set("gyc" + req.body.email, null)
            if (arrCouponCodes.length !== outcome[0].couponCodes.length) {
              res.send("Coupon Removed!")
              await AccountInfo.updateOne(
                { "_id" : outcome[0]._id }, 
                { "$set" : { 
                  "couponIds": arrIds}, //
                  "couponsCurrentlyClaimed": outcome[0].couponsCurrentlyClaimed - 1 ,
                  "couponCodes": arrCouponCodes
                }, 
                { "upsert" : false } 
              );
              const unclaimCode = (codes, code) => {
                let i = 0;
                const iMax = codes.length;
                let couponCodes = codes;
                for (; i< iMax ; i++) if(couponCodes[i] === code) {
                  couponCodes[i] = couponCodes[i].substring(0, couponCodes[i].length - 1) + "a";
                  break;
                }
                return couponCodes;
              }
              const updatedCodes = unclaimCode(coupon[0].couponCodes, couponCode)
              await Coupon.updateOne(
                { "_id" : req.body._id },
                { "$set" : { 
                  "couponCodes": updatedCodes},
                  "amountCoupons": (coupon[0].amountCoupons + 1),
                  "couponStillValid": true
                }, 
                { "upsert" : false } 
              );
            } else res.status(400).send("Coupon Already Removed!")
      } else res.status(400).send("You need to be logged in and have a valid subscription in order to claim coupons!");
    }
  })

app.get('*', (req, res) => {
  const store = createStore({ coupons: undefined, popup: undefined, menuActive: false, loggedInKey: undefined, email: undefined, lat: undefined, long: undefined  })
	const state = store.getState()
	const html = render(
		<Provider store={store}>
      <div style={"background-color: ghostwhite; border: solid; border-color: lightgray; border-radius: 5px; border-width: 1px; padding-top:100px; padding-bottom:100px; width:90%; margin:auto;"}>
        <a href="/" style={"width:100%; text-align:center; font-size: 0.75em; font-weight: bold; color: #002e5b; text-decoration: none;"}><h1 style={"background-color: #fde428;"}>UnlimitedCouponer</h1></a>
        <a href="/" style={"width:100%; margin-top:24px; text-align:center; font-size: 0.75em; font-weight: bold; color: #002e5b; text-decoration: none;"}><h2>404 not found. Click here go home</h2></a>
        <p style={"width:100%; margin-top:24px; text-align:center;"}>The url: {req.originalUrl} could not be found.</p>
        <p style={"width:100%; margin-top:24px;text-align:center; color: grey;"}>If you think you reached this page in error, please contact us at unlimitedcouponer@gmail.com</p>
        <h2 style={"width:100%; text-align:center; font-size: 1em; margin-top:800px; font-weight: bold; color: #002e5b; text-decoration: none;"}>What are you doing down here?</h2>
        <img style={"width:80%; margin-left:10%;"} src="/giphy.gif"/>
      </div>
		</Provider>
	)
	res.send(HTMLShell(html, state)).status(404);
});

app.listen(4000, () => console.log("Server Starting"));
