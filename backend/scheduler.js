import scheduler from 'node-schedule'

export const scheduleJob = (timestamp, job, cb) => {
  const date = new Date(timestamp)
  scheduler.scheduleJob(date, () => {
    cb(job)
  })
}
