import dnode from 'dnode'
import { LOGIN_URL, SOCKET_PORT } from '../../config'
import { dbGet, dbUpdate } from './api'
import { runBooking } from './nightmare'
import { getTimeDifference } from './sync'
import { scheduleJob } from './scheduler'
import { sendEmail } from './email'

const EMAIL_TEMPLATES = {
  SUCCESS: {
    BOOKING_PLANNED: {
      subject: 'Booking planned',
      text: 'I will not fail you!'
    },
    BOOKING_DONE: {
      subject: 'Booking done',
      text: 'I have not failed you, its tennis time!'
    }
  },  
  ERROR: {
    subject: 'Booking error',
    text: 'I have failed you!'
  }
}

const planBooking = (data, date) => {

}

const canBookNow = (date) => {
  const now = new Date()
  const isWeekend = (date.getDay() == 6) || (date.getDay() == 0)
  const hoursDifference = (date.getTime() - now.getTime()) / 3600000

  return isWeekend
    ? hoursDifference <= 6
    : hoursDifference <= 48
}

async function book(data, cb) {
  try {
    const { startTime, dateObj: { day, month, year }} = data
    const date =  new Date(year, month-1, day, startTime) // month start at 0
    const isBookable = canBookNow(date)
  
    const success = (isBookable)
      ? await runBooking(data)
      : await planBooking(data, date)
 
    const templateEmail = success 
      ? (isBookable ? EMAIL_TEMPLATES['SUCCESS']['BOOKING_DONE'] : EMAIL_TEMPLATES['SUCCESS']['BOOKING_PLANNED'])
      : EMAIL_TEMPLATES['ERROR']

    await sendEmail(templateEmail)   

     // Let frontend now it worked
    cb(null, data) 

  } catch(e) {
    await sendEmail(EMAIL_TEMPLATES['ERROR'])
    // Let frontend know there was a fuck up
    cb(e, data)
  }
 }


/** INIT  **/
async function init() {
  try {
    const server = dnode({
      book // expose  book function to frontend
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
