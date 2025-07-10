
const cron = require('node-cron');
const logger = require('./logger');

// Daily cleanup task
const dailyCleanup = cron.schedule('0 0 * * *', () => {
    logger.info('Running daily cleanup task');
    // Add cleanup logic here
}, {
    scheduled: false
});

// Hourly stats update
const hourlyStatsUpdate = cron.schedule('0 * * * *', () => {
    logger.info('Running hourly stats update');
    // Add stats update logic here
}, {
    scheduled: false
});

const startCronJobs = () => {
    logger.info('Starting cron jobs');
    dailyCleanup.start();
    hourlyStatsUpdate.start();
};

const stopCronJobs = () => {
    logger.info('Stopping cron jobs');
    dailyCleanup.stop();
    hourlyStatsUpdate.stop();
};

module.exports = {
    startCronJobs,
    stopCronJobs
};
