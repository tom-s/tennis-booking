'use strict';

import prompt from 'prompt'
import waterfall from 'async-waterfall'
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

//
// Start the prompt
//
prompt.start()


waterfall([
  (callback) => {
    prompt.get(['date'], (err, { date }) => {
      const dateObj = extractDate(date)
      callback(null, { ...dateObj})
    })
  },
  (res, callback) => {
    prompt.get(['time'], (err, { time }) => {
      const startTime = pad(parseInt(time))
      callback(null, {
        ...res,
        startTime,
        endTime: pad(parseInt(time) + 1)
      })
    })
  },
  (res, callback) => {
    prompt.get(['court'], (err, { court = 1 }) => {
      callback(null, {
        ...res,
        court: parseInt(court)
      })
    })
  },
  (res, callback) => {
    dnode.connect(5050, (remote) => {
      callback(null, { remote, data: res })
    })
  }
], (err, { remote, data}) => {
  //runBooking(result)
  remote.book(data, (err, res) => {
    if(err) {
      console.log("an error occured", err)
    } else {
      console.log("booking done")
    }
  })
})
