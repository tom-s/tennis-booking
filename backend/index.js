import dnode from 'dnode'
import { LOGIN_URL, SOCKET_PORT } from '../../config'
import { dbGet, dbAddJob, dbDeleteJob } from './api'
import { runBooking } from './nightmare'
import { scheduleJob } from './scheduler'
import { EMAIL_TEMPLATES, formatEmail, sendEmail } from './email'
import { MS_PER_HOUR } from './common'

const canBookNow = (date) => {
  const now = new Date()
  const isWeekend = (date.getDay() == 6) || (date.getDay() == 0)
  const hoursDifference = (date.getTime() - now.getTime()) / MS_PER_HOUR

  return isWeekend
    ? hoursDifference <= 6
    : hoursDifference <= 48
}


async function doBooking(data) {
  try {
    await runBooking(data)
    await sendEmail(formatEmail(data, EMAIL_TEMPLATES['SUCCESS']['BOOKING_DONE']))
    return true
  } catch(e) {
    await sendEmail(formatEmail(data, EMAIL_TEMPLATES['ERROR']))
  }
 }

 async function scheduleBooking(data, date) {
  try {
    const isWeekend = (date.getDay() == 6) || (date.getDay() == 0)
    const executionTime = isWeekend
      ? date.getTime() - MS_PER_HOUR * 6
      : date.getTime() - MS_PER_HOUR * 48
    const job = {...data, executionTime}
    await dbAddJob(job)
    await sendEmail(formatEmail(job, EMAIL_TEMPLATES['SUCCESS']['BOOKING_PLANNED']))
    return true
  } catch(e) {
    await sendEmail(formatEmail(data, EMAIL_TEMPLATES['ERROR']))
  }
 }



/** INIT  **/
async function init() {
  try {
    const server = dnode({
      book: async function(data, cb) {
        const { startTime, dateObj: { day, month, year }} = data
        const date =  new Date(year, month-1, day, startTime) // month start at 0
        const isBookable = true //debug canBookNow(date)
        console.log("debug bookable ?", isBookable)
        const success = (isBookable)
          ? await doBooking(data)
          : await scheduleBooking(data, date)
        cb(null)
        init() // restart so that scheduled job is queued
      } // expose  book function to frontend
    })

    // Retrieve list of jobs
    const jobs = await dbGet('jobs')

    const now = new Date()
    const pastJobs = jobs.items.filter(job => job.executionTime <= now.getTime())
    const futureJobs = jobs.items.filter(job => job.executionTime > now.getTime())

    // Do past jobs that should have been done before
    pastJobs.forEach(async function(job) {
      console.log("handle past job", job)
      await doBooking(job)
      console.log("now unplan")
      await dbDeleteJob(job)
    })

    // Schedule future jobs
    futureJobs.forEach(async function(job) {
      console.log("handle future job", job)
      await scheduleJob(job.executionTime, job) // wait for job to be triggered
      await doBooking(job)
      await dbDeleteJob(job)
    })

    // Run server
    server.listen(SOCKET_PORT)
  } catch(e) {
    console.log('error', e)
  }
}

init()
