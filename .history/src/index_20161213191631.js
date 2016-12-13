import prompt from 'prompt'
import NightmareFactory from 'nightmare'

import { LOGIN_URL, USERNAME, PWD } from '../config'

//
// Start the prompt
//
prompt.start()

//
// Get two properties from the user: username and email
//
prompt.get(['date'], (err, result) => {
  //
  // Log the results.
  //
  console.log('Command-line input received:')
  console.log('  date: ' + result.date)

  runBooking()
})



/* Run casper scraper */
const runBooking = () => {
  const nightmare = NightmareFactory({ show: true })
  nightmare
    .goto(LOGIN_URL)
    .type('form[name=membreLoginForm] [name=login]', USERNAME)
    .type('form[name=membreLoginForm] [name=password]', PWD)
    .click('form[name=membreLoginForm] input[name=buttonConnecter]')
    .wait('form[name=membreIdentiteForm]')
    .click('a[title="Tableaux par jour"]')
    .wait('form#form_filtre')
    //.click('a.date-picker-control')
    //.click('.cd-20161205')
    .end()
    .then(function (result) {
      console.log("Booking done !", result)
   })
  .catch(function (error) {
    console.error('Search failed:', error)
  })
}
