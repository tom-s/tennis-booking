import { MAILGUN } from '../../config'
import mailgun from 'mailgun-js'

// Set up emails
const mailer = mailgun(MAILGUN)

export const sendEmail = ({subject='test email', text='test email', to='thom.schell@gmail.com'}) => {
  return new Promise((resolve, reject) => {
    const message = {
      from: 'tennis-booking@thomster.ddns.net',
      to,
      subject,
      text
    }
    mailer.messages().send(message, (error, body) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}
