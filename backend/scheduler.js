import scheduler from 'node-schedule'

export const scheduleJob = (timestamp, job) => {
  return new Promise((resolve, reject) => {
    const date = new Date(timestamp)
    scheduler.scheduleJob(date, () => {
      resolve(job)
    })
  })
}
