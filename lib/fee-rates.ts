// Service fees charged to clients per order
// Modify these to adjust the rates
export const SERVICE_FEES = {
  delivery:   3.00,   // €/order for each DELIVERED order
  return:     2.00,   // €/order for each RETURNED order
  callCenter: 0.50,   // €/order confirmation (applied to DELIVERED only)
} as const

export type ServiceFees = typeof SERVICE_FEES
