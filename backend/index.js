import dnode from 'dnode'
import { LOGIN_URL, USERNAME, PWD, PLAYERS, SOCKET_PORT } from '../../config'
import { dbGet, dbUpdate } from './api'
import { runBooking } from './nightmare'
import { getTimeDifference } from './sync'
import { scheduleJob } from './scheduler'

const planBooking = (date, data) => {

}

const canBookNow = (date) => {
  
}

async function book(data, cb) {
  console.log("book", data, cb)
  const { startTime, dateObj: { day, month, year }} = data
  const date =  new Date(year, month-1, day, startTime) // month start at 0
  const action = canBookNow(data)
    ? book(data)
    : planBooking(date, data)

  /*
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
  }*/
 }


/** INIT  **/
async function init() {
  try {
    const server = dnode({
      book
    })

    //const timeDifference = await getTimeDifference()
    //console.log("time diffrence", timeDifference)

    // Retrieve list of jobs
    const jobs = await dbGet('jobs')
    console.log("JOBS", jobs)

    // Schedule jobs
    Object.keys(jobs).forEach(timestamp => {
      scheduleJob(timstamp, jobs[timestamp])
    })

    // Run server
    server.listen(SOCKET_PORT)
  } catch(e) {
    console.log('error', e)
  }
}

init()
