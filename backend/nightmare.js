import NightmareFactory from 'nightmare'
import { LOGIN_URL, USERNAME, PWD, PLAYERS } from '../../config'

const HTTP_WAIT = 1000

/* This is a copy of https://github.com/segmentio/nightmare/blob/master/lib/actions.js without the blur stuff */
var focusSelector = function(done, selector) {
  return this.evaluate_now(
    function(selector) {
      document.querySelector(selector).focus()
    },
    done.bind(this),
    selector
  )
}


const typeWithoutBlur = function() {
  var selector = arguments[0],
    text,
    done
  if (arguments.length == 2) {
    done = arguments[1]
  } else {
    text = arguments[1]
    done = arguments[2]
  }

  var self = this

  focusSelector.bind(this)(function(err) {
    if (err) {
      return done(err)
    }

    var blurDone = done // no blur
    if ((text || '') == '') {
      this.evaluate_now(
        function(selector) {
          document.querySelector(selector).value = ''
        },
        blurDone,
        selector
      )
    } else {
      self.child.call('type', text, blurDone)
    }
  }, selector)
}

NightmareFactory.action('typeWithoutBlur', typeWithoutBlur)

/* Run nightmare scraper */
export const runBooking = ({dateObj:date, startTime, endTime, court, opponent}) => {
  const dateStr = `${date.year}${date.month}${date.day}`
  const courtId = court == 1
    ? 21133
    : 21134

  return new Promise((resolve, reject) => {
    const nightmare = NightmareFactory({
      show: false, //true,
      //show: true,
      openDevTools: false,
      //openDevTools: true,
      typeInterval: 20,
      pollInterval: 50 //in ms
    })
    nightmare
      .goto(LOGIN_URL)
      .wait('.userlogin')
      .click('.userlogin > a')
      .wait('#edit-name')
      .type('#edit-name', USERNAME)
      .type('#edit-pass', PWD)
      .click('#edit-submit')
      .wait('.nomPrenom')
      .goto(`${LOGIN_URL}/adherent/reservations/${dateStr}`)
      .wait('.adherent-reservation-calendrier-row')
      .click(`[id='${courtId}_${startTime}00'] > a`)
      .wait("#autocomplete-deluxe-input")
      .typeWithoutBlur("#autocomplete-deluxe-input", opponent.name) // we cannot use type as it blurs the input after typing
      .wait("#ui-id-3 .ui-corner-all")
      .click("#ui-id-3 .ui-corner-all")
      .wait("#edit-submit")
      .click("#edit-submit")
      .then(() => {
        resolve(true)
      })
      .catch((error) => {
        console.log("error", error)
        reject(error)
      })
  })
}
