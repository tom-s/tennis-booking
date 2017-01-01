import scheduler from 'node-schedule'

const executeJob = (job) => {
  console.log("execute job", job)
}

export const scheduleJob = (timestamp, job) => {
  const date = new Date(timestamp)
  scheduler.scheduleJob(date, () => {
    executeJob(job)
  })
}
