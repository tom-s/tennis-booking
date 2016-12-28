import dnode from 'dnode'
import NightmareFactory from 'nightmare'
import { LOGIN_URL, USERNAME, PWD, PLAYERS, SOCKET_PORT, MAILGUN } from '../../config'
import nodemailer from 'nodemailer'
import mg from 'nodemailer-mailgun-transport'
import mailgun from 'mailgun-js'

// Set up emails
const mailer = mailgun(MAILGUN)

const sendEmail = ({subject='test email', text='test email', to='thom.schell@gmail.com'}) => {
  return new Promise((resolve, reject) => {
    resolve()
    /*
    const message = {
      from: 'tennis-booking@thomster.ddns.net',
      to,
      subject,
      text
    }
    mailer.messages().send(message, (error, body) => {
      if (err) {
        reject()
      } else {
        resolve()
      }
    })*/
  })
}

/* Run casper scraper */
const runBooking = (data, cb) => {
  return new Promise((resolve, reject) => {
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
      .click(`.cd-${data.year}${data.month}${data.day}`)
      .wait(`div[title*="${data.startTime}h00 à"]`)
      .click(`#scrollDonneesTableau>div .colonneCourtJour:nth-child(${data.court}) div[title*="${data.startTime}h00 à"]`)
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
      .end()
      .then(() => {
        resolve()
      })
      .catch((error) => {
        reject(error)
      })
  })
}

async function scheduleJob(data) {

}

async function book(data, cb) {
  try {
    await runBooking(data)
    await sendEmail({
      subject: 'Booking done !',
      text: 'Booking done !'
    })
    // Let frontend now it worked
    cb(null, data)
  } catch(e) {
    await sendEmail({
      subject: 'Booking failed :-(',
      text: 'Booking could not be done'
    })
    // Let frontend know there was a fuck up
    cb(e, data)
  }
 }

const server = dnode({
  book
})


/** INIT  **/
// Retrieve persistant jobs

// Add them to the list

// Run server
server.listen(SOCKET_PORT)
