import prompt from 'prompt'
import NightmareFactory from 'nightmare'
import waterfall from 'async-waterfall'
import { LOGIN_URL, USERNAME, PWD, PLAYERS } from '../config'

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

//
// Start the prompt
//
prompt.start()


waterfall([
  (callback) => {
    prompt.get(['date'], (err, { date }) => {
      const dateObj = extractDate(date)
      callback(null, { ...dateObj})
    })
  },
  (res, callback) => {
    prompt.get(['time'], (err, { time }) => {
      const startTime = pad(parseInt(time))
      callback(null, {
        ...res,
        startTime,
        endTime: pad(parseInt(time) + 1)
      })
    })
  },
  (res, callback) => {
    prompt.get(['court'], (err, { court = 1 }) => {
      callback(null, {
        ...res,
        court: parseInt(court)
      })
    })
  },
], (err, result) => {
  runBooking(result)
})



/* Run casper scraper */
const runBooking = (date) => {
  const nightmare = NightmareFactory({ 
    show: true,
    typeInterval: 20 
  })
  nightmare
    .goto(LOGIN_URL)
    .type('form[name=membreLoginForm] [name=login]', USERNAME)
    .type('form[name=membreLoginForm] [name=password]', PWD)
    .click('form[name=membreLoginForm] input[name=buttonConnecter]')
    .wait('a[title="Tableaux par jour"]')
    .click('a[title="Tableaux par jour"]')
    .wait('a#fd-but-date')
    .click('a#fd-but-date')
    .click(`.cd-${date.year}${date.month}${date.day}`)
    .wait(`div[title*="${date.startTime}h00 à"]`)
    .click(`#scrollDonneesTableau>div .colonneCourtJour:nth-child(${date.court}) div[title*="${date.startTime}h00 à"]`)
    .wait('form#reservationPonctuelleJoueurForm')
    .evaluate(() => {
      // Make hidden inputs visible so that we can modify their values
      document.querySelector('#identifiantMembreDeux_value').type = 'text'
      document.querySelector('#nomMembre2_value').type = 'text'
      return true
    })
    .insert('#identifiantMembreDeux_value', PLAYERS.HESTER.id)
    .insert('#nomMembre2_value', PLAYERS.HESTER.name)
    .insert('#identifiantMembreDeux', PLAYERS.HESTER.name)
    .click('input[name=buttonRechercher]')
    .wait('.dialog input[name=buttonRechercher]')
    //.click('.dialog input[name=buttonRechercher]') only when in prod !
    //.wait('#fsdf')
    .end()
    .then(function (result) {
      console.log("Booking done !", result)
   })
  .catch(function (error) {
    console.error('Search failed:', error)
  })
}
