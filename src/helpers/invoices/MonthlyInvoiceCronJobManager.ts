import CronJobManager from 'cron-job-manager';

import { config } from 'config/config';

import { generateMonthlyInvoices, sendMonthlyInvoicesToCustomers } from './monthlyInvoiceHelpers';

export class MonthlyInvoiceCronJobManager {
  private static cronJobManager: CronJobManager = new CronJobManager(
    'MONTHLY_INVOICE_CRON_JOB',
    config.deployment.monthlyInvoiceCronJobString, // At 05:00 AM, on day 1 of the every month, https://crontab.cronhub.io/

    // (() => {
    //   const date = new Date();
    //   date.setSeconds(date.getSeconds() + 3);

    //   return date;
    // })(),

    async () => {
      await MonthlyInvoiceCronJobManager.sendMonthlyInvoices();
    },

    {
      // extra options..
      // see https://www.npmjs.com/package/cron for all available
      start: false,
      timezone: 'Etc/Universal',
    },
  );

  public static startAllJobs() {
    this.cronJobManager.startAll();
  }

  public static stopAllJobs() {
    this.cronJobManager.stopAll();
  }

  public static startJob(jobName: string) {
    this.cronJobManager.start(jobName);
  }

  public static stopJob(jobName: string) {
    this.cronJobManager.stop(jobName);
  }

  public static getAllJobs() {
    return this.cronJobManager.listCrons();
  }

  public static addNewJob(
    jobName: string,
    dateOrCronString: string | Date,
    functionToExecuteWhenTheTimeComes: () => void,
    options?: {
      start?: boolean;
      timezone?: string;
    },
  ) {
    this.cronJobManager.add(jobName, dateOrCronString, functionToExecuteWhenTheTimeComes, options);
  }

  public static testCronJobManager() {
    const date = new Date();
    date.setSeconds(date.getSeconds() + 1);

    MonthlyInvoiceCronJobManager.addNewJob(
      'TEST-SPECIFIC-DATE',
      date,
      () => {
        console.log('TEST-SPECIFIC-DATE');
      },
      {
        // extra options..
        // see https://www.npmjs.com/package/cron for all available
        start: false,
      },
    );

    this.startJob('TEST-SPECIFIC-DATE');
  }

  public static async sendMonthlyInvoices() {
    await generateMonthlyInvoices();
    await sendMonthlyInvoicesToCustomers();
  }
}

// EXAMPLE
// function scheduler(key, cron, callback) {
//   cronManager.add(key, cron, callback.bind(this, key, cron));
// }

// function callback(key, cron) {
//   console.log(key);
//   console.log(cron);
// }

// scheduler('key', ' * * * * *', callback);
