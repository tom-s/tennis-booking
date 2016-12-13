import dnode from 'dnode'
import NightmareFactory from 'nightmare'
import { LOGIN_URL, USERNAME, PWD, PLAYERS, SOCKET_PORT } from '../../config'

/* Run casper scraper */
const runBooking = (data, cb) => {
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
    //.wait('#fsdf')
    .end()
    .then(() => { cb(null, data )})
    .catch((e) => { cb(e) })
}

const server = dnode({
  book : (data, cb) => {
    console.log("try booking", data)
    runBooking(data, cb)
  }
})

server.listen(SOCKET_PORT)