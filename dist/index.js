'use strict';

var _prompt = require('prompt');

var _prompt2 = _interopRequireDefault(_prompt);

var _nightmare = require('nightmare');

var _nightmare2 = _interopRequireDefault(_nightmare);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LOGIN_URL = 'https://adoc.app.fft.fr/';
var USERNAME = 'thomasschell';
var PWD = 'tenraymonde';

// 
// Start the prompt 
// 
_prompt2.default.start();

// 
// Get two properties from the user: username and email 
// 
_prompt2.default.get(['date'], function (err, result) {
  // 
  // Log the results. 
  // 
  console.log('Command-line input received:');
  console.log('  date: ' + result.date);

  runBooking();
});

/* Run casper scraper */
var runBooking = function runBooking() {
  var nightmare = (0, _nightmare2.default)({ show: true });
  nightmare.goto(LOGIN_URL).type('form[name=membreLoginForm] [name=login]', USERNAME).type('form[name=membreLoginForm] [name=password]', PWD).click('form[name=membreLoginForm] input[name=buttonConnecter]').wait('form[name=membreIdentiteForm]').click('a[title="Tableaux par jour"]').wait('form[name=tableauJourForm]').click('a#fd-but-date').evaluate(function () {
    return document.querySelector('table.date-picker-table').href;
  }).end().then(function (result) {
    console.log("Booking done !", result);
  }).catch(function (error) {
    console.error('Search failed:', error);
  });
};

/*
casper.then(() => {
console.log("FORM", document.querySelectorAll('form[name=membreLoginForm]'))
this.fill('form[name=membreLoginForm]', {
  'login': 'thomasschell',
  'password': 'tenraymonde',
}, false)
}, (ret) => {
console.log('login form filled')
})
  console.log("3 ---")
casper.then(() => {
//this.click('input[name=buttonConnecter]')
console.log("loggin in")
})
*/