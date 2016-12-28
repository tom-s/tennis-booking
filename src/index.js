'use strict';

import prompt from 'prompt-promise'
import { SOCKET_PORT } from '../config'
import dnode from 'dnode'

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
    dnode.connect(5050, (remote) => {
      resolve(remote)
    })
  })
}

async function promptUser() {
  try {
    const date = await prompt('Date of the booking (ex: 06/01/2017) -> ')
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
      } else {
        console.log("booking done")
      }
    })
  } catch(e) {
    console.log("an error occured: ", e)
  }
}



//
// Start the prompt
//
promptUser()