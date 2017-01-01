import fetch from 'node-fetch'
import { LOGIN_URL } from '../../config'

export const getTimeDifference = (key) => {
  return new Promise((resolve, reject) => {
    fetch(LOGIN_URL).then(response => {
      if (response.status !== 200) {  
        reject(response)
      } else {
        const serverTimestamp = new Date(response.headers.get('Date')).getTime()
        console.log("server", serverTimestamp)
        const localTimestamp = new Date().getTime()
        console.log("local", localTimestamp)
        resolve(localTimestamp - serverTimestamp)
      }
    }).catch(err => {  
      reject(err)
    })
  })
}

// Retrieve distant server time
    