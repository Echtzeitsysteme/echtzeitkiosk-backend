export enum CustomerInvoiceType {
  MONTHLY = 'MONTHLY', // it will be send every month on the 1st day of the month
  AD_HOC = 'AD_HOC', // it will be send when the superuser pushes the button or the user deposits money. it will only contain the current user balance without the customer orders
}

export enum CustomerInvoiceStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
}
