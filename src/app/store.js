import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import chatReducer from '../features/chat/chatSlice'
import financeReducer from '../features/finance/financeSlice'
import notificationReducer from '../features/notifications/notificationSlice'
import foodBookingReducer from '../features/food/foodBookingSlice'
import foodReducer from '../features/food/foodPlanSlice'
import hostelReducer from '../features/hostels/hostelSlice'
import maintenanceReducer from '../features/maintenance/maintenanceSlice'
import paymentReducer from '../features/payments/paymentSlice'
import roomsReducer from '../features/rooms/roomsSlice'
import switchReducer from '../features/switches/switchSlice'
import stayRequestReducer from '../features/stayRequests/stayRequestSlice'
import tenantReducer from '../features/tenants/tenantSlice'
import vacateReducer from '../features/vacates/vacateSlice'

// Central Redux store. Add a feature's reducer here as it is built.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    finance: financeReducer,
    notifications: notificationReducer,
    hostels: hostelReducer,
    stayRequests: stayRequestReducer,
    rooms: roomsReducer,
    tenants: tenantReducer,
    vacates: vacateReducer,
    maintenance: maintenanceReducer,
    payments: paymentReducer,
    switches: switchReducer,
    food: foodReducer,
    foodBookings: foodBookingReducer,
  },
})
