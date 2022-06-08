import CronJobManager from 'cron-job-manager';

// import { config } from 'config/config';

import { generateMonthlyInvoices, sendMonthlyInvoicesToCustomers } from './monthlyInvoiceHelpers';

export class MonthlyInvoiceCronJobManager {
  private static cronJobManager: CronJobManager = new CronJobManager(
    'MONTHLY_INVOICE_CRON_JOB',
    // config.deployment.monthlyInvoiceCronJobString, // At 05:00 AM, on day 1 of the every month, https://crontab.cronhub.io/

    (() => {
      const date = new Date();
      date.setSeconds(date.getSeconds() + 1);

      return date;
    })(),
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
    console.log('Sending monthly invoices...');
    await generateMonthlyInvoices();
    console.log('Monthly invoices are created.');

    console.log('Sending monthly invoices to customers...');
    await sendMonthlyInvoicesToCustomers();
    console.log('Monthly invoices are sent to customers.');
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

// User 1
// Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFmYzAxMTVkLWEwMzctNGUzMS04ZWI5LTNiNWM4NGZiZmVjNiIsInJvbGUiOiJTVEFOREFSRCIsImlhdCI6MTY1NDcwMjQ5Mzc0MywiZXhwIjoxNjU0NzM0MDI5NzQzfQ.Kb3ehgslfonWa42MRCD60s8o_iH1y81OijaEFG9ADMQ

// User 2
// Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjRkYmUxYzQ0LWRhYTQtNGZhNy05ZTcwLTRkY2NlNTE1ZjE0MyIsInJvbGUiOiJTVEFOREFSRCIsImlhdCI6MTY1NDcwMDg5MTIyMSwiZXhwIjoxNjU0NzMyNDI3MjIxfQ.Ozb0IbH6IH1QPkYR0EsvjvZhq3JjNSu4IiYB5_X3298
