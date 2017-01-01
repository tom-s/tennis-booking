import dbFactory from 'json-fs-store'
import { DB_PATH } from '../../config'

// Set up db 
const db = dbFactory(DB_PATH)

export const dbGet = (key) => {
  return new Promise((resolve, reject) => {
    db.load(key, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

export const dbUpdate = (obj) => {
  return new Promise((resolve, reject) => {
    db.add(obj, (err, jobs) => {
       if (err) {
         reject(err)
       } else {
         resolve(jobs)
       }
    })
  })
}

