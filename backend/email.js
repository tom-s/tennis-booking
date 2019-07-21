import { MAILGUN } from '../../config'
import { pad } from './common'
import mailgun from 'mailgun-js'

// Set up emails
const mailer = mailgun(MAILGUN)

export const EMAIL_TEMPLATES = {
  SUCCESS: {
    BOOKING_PLANNED: {
      subject: 'Réservation planifiée pour le %date sur le court %court',
      text: 'Le job de réservation sera exécuté le %executionDate, patience !'
    },
    BOOKING_DONE: {
      subject: 'Réservée effectuée pour le %date sur le court %court',
      text: "Réservation effectuée, have fun !"
    }
  },  
  ERROR: {
    subject: 'Erreur de réservation pour le %date sur le court %court',
    text: "La réservation n'a pas pas être effectuée, le court doit être déjà occupé !"
  }
}

export const sendEmail = ({subject='test email', text='test email', to='thom.schell@gmail.com', cc=''}) => {
  return new Promise((resolve, reject) => {
    const message = {
      from: 'tennis-booking@thomschell.com',
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
  const { court, dateObj, startTime, executionTime, opponent } = data
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
    text: replacements.reduce((memo, data) => memo.replace(data.name, data.value), template.text),
    cc: opponent.email
  }
}
