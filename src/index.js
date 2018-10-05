'use strict';

import prompt from 'prompt-promise'
import dnode from 'dnode'
import { SOCKET_PORT } from '../config'

const getTomorrowAsString = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return `${pad(tomorrow.getDate())}/${pad(tomorrow.getMonth() + 1)}/${tomorrow.getFullYear()}`

}
const pad = (num, size=2) => {
  let s = num +'';
  while (s.length < size) s = '0' + s
  return s
}

const extractDate = (dateStr='', separator = '/') => {
   const data = dateStr.split(separator)
   return {
     day: pad(data[0]),
     month: pad(data[1]),
     year: pad(data[2])
   }
}

async function connect() {
  return new Promise((resolve, reject) => {
    dnode.connect(SOCKET_PORT, (remote) => {
      resolve(remote)
    })
  })
}

async function promptUser() {
  try {
    const date = await prompt(`Date of the booking (ex tomorrow: ${getTomorrowAsString()}) -> `)
    const time = await prompt('Time of the booking (ex: 13 for 1PM) -> ')
    const court = await prompt('Court of the booking (1 or 2) -> ')
    const remote = await connect()

    // Format data
    const booking = {
      dateObj: extractDate(date),
      startTime:  pad(parseInt(time)),
      endTime: pad(parseInt(time) + 1),
      court: parseInt(court)
    }

    // Do the booking
    remote.book(booking, (err, res) => {
      if(err) {
        console.log("an error occured:", err)
        process.exit(1)
      } else {
        console.log("done")
        process.exit()
      }
    })
  } catch(e) {
    console.log("an error occured: ", e)
    process.exit(1)
  }
}



//
// Start the prompt
//
promptUser()