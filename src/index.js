import prompt from 'prompt'
import NightmareFactory from 'nightmare'

import { LOGIN_URL, USERNAME, PWD } from '../config'

const pad = (num, size=2) => {
  let s = num +'';
  while (s.length < size) s = '0' + s
  return s
}

const extractDate = (dateStr='', separator = '/') => {
   const data = dateStr.split(separator)
   return {
     day: pad(data[0]),
     month: pad(data[1]),
     year: pad(data[2])
   }
}

// return `${pad(data[0])}${pad(data[1])}${pad(data[2])}`

//
// Start the prompt
//
prompt.start()

//
// Get two properties from the user: username and email
//
prompt.get(['date'], (err, { date }) => {
  //
  // Log the results.
  //
  console.log('Command-line input received:')
  console.log('  date: ' + date)

  const dateObj = extractDate(date)

  runBooking(dateObj)
})



/* Run casper scraper */
const runBooking = (date) => {
  const nightmare = NightmareFactory({ show: true })
  nightmare
    .goto(LOGIN_URL)
    .type('form[name=membreLoginForm] [name=login]', USERNAME)
    .type('form[name=membreLoginForm] [name=password]', PWD)
    .click('form[name=membreLoginForm] input[name=buttonConnecter]')
    .wait('form[name=membreIdentiteForm]')
    .click('a[title="Tableaux par jour"]')
    .wait('#tableauCourt')
    .click('a#fd-but-date')
    .click(`.cd-${date.year}${date.month}${date.day}`)
    .wait('#fsdfds')
    .end()
    .then(function (result) {
      console.log("Booking done !", result)
   })
  .catch(function (error) {
    console.error('Search failed:', error)
  })
}
