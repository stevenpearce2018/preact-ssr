const express = require("express");
const { h } = require("preact");
const render = require("preact-render-to-string");
import { Provider } from 'unistore/preact'
import Helmet from 'preact-helmet'
const { App } = require("./src/App");
const path = require("path");
require('dotenv').config()
const app = express();
// const redisHelper = require('./redisHelper')
const bodyParser = require('body-parser');
const minify = require('express-minify');
const compression = require('compression')
const sm = require('sitemap');
const favicon = require('serve-favicon');

// const requireHTTPS = (req, res, next) => {
//   // The 'x-forwarded-proto' check is for Heroku
//   if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") return res.redirect('https://' + req.get('host') + req.url);
//   next();
// }
// app.use(requireHTTPS);
app.use(favicon(__dirname + '/favicon.ico'));
app.use(compression());
app.use(minify());
app.use(bodyParser.json({limit:'50mb'}))
app.use(bodyParser.urlencoded({ extended: true, limit:'50mb' }))
app.use('*/robots.txt', (req, res, next) => {
    res.type('text/plain')
    res.send("# GSM: https://www.unlimitedcouponer.com\nSitemap: https://www.unlimitedcouponer.com/sitemap.xml\nUser-agent: *\nDisallow: /");
  });
  
  const sitemap = sm.createSitemap ({
    hostname: 'https://www.unlimitedcouponer.com',
    cacheTime: 600000,
    urls: [
      { url: '/Home',  changefreq: 'daily', priority: 0.3 },
      { url: '/Search',  changefreq: 'daily',  priority: 0.3 },
      { url: '/About',  changefreq: 'monthly',  priority: 0.7 },
      { url: '/Login',  changefreq: 'monthly',  priority: 0.7 },
      { url: '/Signup',  changefreq: 'monthly',  priority: 0.7 },
    ]
  });
  app.use('*/sitemap.xml', (req, res) => {
    sitemap.toXML((err, xml) => {
      if (err) return res.status(500).end();
      res.header('Content-Type', 'application/xml');
      res.send( xml );
    });
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
        </head>
        <body>
            <noscript>
                You need to enable JavaScript to run this app.
            </noscript>
            <div id="app">${html}</div>
            <script>window.__STATE__=${JSON.stringify(state).replace(/<|>/g, '')}</script>
            <script src="./app.js"></script>
            <script src="https://maps.google.com/maps/api/js?key=AIzaSyDSPHIFPEXvdY0sLi9E2fhPzZgeP6Aat2o" async></script>
            <script src="https://js.stripe.com/v3/" async></script>
        </body>
    </html>`

app.use(express.static(path.join(__dirname, "dist")));

app.get('*', (req, res) => {
	const store = createStore({ count: 0, logginkey: undefined, email: undefined, lat: undefined, long: undefined  })

	const state = store.getState()

	const html = render(
		<Provider store={store}>
			<Router />
		</Provider>
	)

	res.send(HTMLShell(html, state))
})

app.listen(4000);
