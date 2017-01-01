import { MAILGUN } from '../../config'
import { pad } from './common'
import mailgun from 'mailgun-js'

// Set up emails
const mailer = mailgun(MAILGUN)

export const EMAIL_TEMPLATES = {
  SUCCESS: {
    BOOKING_PLANNED: {
      subject: 'Booking planned for %date on court %court',
      text: 'The schedule job will run on %executionDate, I will not fail you!'
    },
    BOOKING_DONE: {
      subject: 'Booking done for %date on court %court',
      text: 'I have not failed you, its tennis time!'
    }
  },  
  ERROR: {
    subject: 'Booking have failed for %date on court %court, perhaps the court is not available ?',
    text: 'I have failed you ! (but also, I really think the court is not available !)'
  }
}

export const sendEmail = ({subject='test email', text='test email', to='thom.schell@gmail.com', cc='hester.borren@gmail.com'}) => {
  return new Promise((resolve, reject) => {
    resolve()
    const message = {
      from: 'tennis-booking@thomster.ddns.net',
      to,
      cc,
      subject,
      text
    }
    mailer.messages().send(message, (error, body) => {
      if (error) {
        console.log("error sending email")
        reject(error)
      } else {
        console.log("sent email")
        resolve()
      }
    })
  })
}

export const formatEmail = (data, template) => {
  const { court, dateObj, startTime, executionTime } = data
  const executionDate = new Date(executionTime)
  const replacements = [
    { 
      'name': '%date',
      'value': `${dateObj.day}/${dateObj.month}/${dateObj.year} at ${startTime}:00`
    },
    { 
      'name': '%executionDate',
      'value': `${pad(executionDate.getDate())}/${pad(executionDate.getMonth() + 1)}/${pad(executionDate.getFullYear())} at ${pad(executionDate.getHours())}:${pad(executionDate.getMinutes())}`
    },
    { 
      'name': '%court',
      'value': court
    }
  ]
  return {
    subject: replacements.reduce((memo, data) => memo.replace(data.name, data.value), template.subject),
    text: replacements.reduce((memo, data) => memo.replace(data.name, data.value), template.text)
  }
}
