import dbFactory from 'json-fs-store'
import { DB_PATH } from '../../config'
import { MS_PER_HOUR } from './common'

// Set up db 
const db = dbFactory(DB_PATH)

const dbUpdate = (obj) => {
  return new Promise((resolve, reject) => {
    db.add(obj, (err) => {
       if (err) {
         reject(err)
       } else {
         resolve(obj)
       }
    })
  })
}

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

export async function dbAddJob(data) {
  const jobs = await dbGet('jobs')
  jobs.items = [
    ...jobs.items,
    data
  ]
  return dbUpdate(jobs)
}

export async function dbDeleteJob({executionTime}) {
  const jobs = await dbGet('jobs')
  jobs.items = jobs.items.filter(job => job.executionTime !== executionTime)
  return dbUpdate(jobs)
}

