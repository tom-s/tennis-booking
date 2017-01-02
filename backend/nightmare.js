import NightmareFactory from 'nightmare'
import { LOGIN_URL, USERNAME, PWD, PLAYERS } from '../../config'

const HTTP_WAIT = 1000

/* Run nightmare scraper */
export const runBooking = ({dateObj:date, startTime, endTime, court}) => {
  const dateStr = date.day + '/' + date.month + '/' + date.year
  const courtId = court == 1
    ? 21133
    : 23683

  return new Promise((resolve, reject) => {
    const nightmare = NightmareFactory({
      //show: true,
      //openDevTools: true,
      typeInterval: 20,
      pollInterval: 50 //in ms
    })
    nightmare
      .goto(LOGIN_URL)
      .type('form[name=membreLoginForm] [name=login]', USERNAME)
      .type('form[name=membreLoginForm] [name=password]', PWD)
      .click('form[name=membreLoginForm] input[name=buttonConnecter]')
      .wait('a[title="Tableaux par jour"]')
      .click('a[title="Tableaux par jour"]')
      .wait('a#fd-but-date')
      .evaluate((dateStr) => {
        window.moveToThisDate(document.tableauJourForm, $('date'), dateStr)
      }, dateStr)
      .wait(HTTP_WAIT) // give some time fot the page to reload -> this is dirty but i haven't found any better
      .evaluate((dateStr, startTime,courtId,  done) => {
          // It's a bit dodgy code, but at least it works in electron (no need to be compiled)
          var boxes = document.querySelectorAll('.donnee')
          let ids = []
          for (var i = 0; i < boxes.length; i++) {
            var box = boxes[i]
            var boxId  = box.getAttribute('id')
            if(boxId) {
              ids = ids.filter(id => id !== boxId)
              ids.push(boxId)
            }
          }
          var id = ids.find(id => id.indexOf(courtId) !== -1)
          var idCreneau = parseInt(id.split('_')[0].replace('creneau', ''), 10)
          window.ajoutReservation(idCreneau,`${startTime}:00`, dateStr)
          done(null, idCreneau)
      }, dateStr, startTime,courtId)
      .evaluate(() => {
        // Make hidden inputs visible so that we can modify their values
        document.querySelector('#identifiantCreneau').type = 'text'
        document.querySelector('#date').type = 'text'
        document.querySelector('#identifiantMembreDeux_value').type = 'text'
        document.querySelector('#nomMembre2_value').type = 'text'
        return true
      })
      .insert('#identifiantMembreDeux_value', PLAYERS.HESTER.id)
      .insert('#nomMembre2_value', PLAYERS.HESTER.name)
      .insert('#identifiantMembreDeux', PLAYERS.HESTER.name)
      .click('input[name=buttonRechercher]')
      .wait('.dialog input[name=buttonRechercher]')
      .click('.dialog input[name=buttonRechercher]')
      .wait(HTTP_WAIT)
      .end()
      .then(() => {
        resolve(true)
      })
      .catch((error) => {
        console.log("error", error)
        reject(error)
      })
  })
}
