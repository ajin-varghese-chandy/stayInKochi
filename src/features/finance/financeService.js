import { getAllSubscriptions } from '../food/foodBookingService'
import { getAllPayments } from '../payments/paymentService'
import { getAllSwitchRequests } from '../switches/switchService'

// Money-related collections, fetched together for the owner's summary.
export function getFinanceData() {
  return Promise.all([
    getAllPayments(),
    getAllSubscriptions(),
    getAllSwitchRequests(),
  ]).then(([payments, subscriptions, switchRequests]) => ({
    payments,
    subscriptions,
    switchRequests,
  }))
}
