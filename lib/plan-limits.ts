export type PlanId = "starter" | "pro" | "enterprise"

export const PLAN_LIMITS: Record<PlanId, { stores: number; ordersPerMonth: number; label: string; price: number }> = {
  starter:    { stores: Infinity,  ordersPerMonth: Infinity,   label: "Pro",        price: 31.99 },
  pro:        { stores: Infinity,  ordersPerMonth: Infinity,   label: "Pro",        price: 31.99 },
  enterprise: { stores: Infinity,  ordersPerMonth: Infinity,   label: "Pro",        price: 31.99 },
}

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[(plan as PlanId)] ?? PLAN_LIMITS.starter
}

export function canAddStore(plan: string, currentStoreCount: number): boolean {
  return currentStoreCount < getPlanLimits(plan).stores
}

export function canAddOrder(plan: string, currentMonthOrders: number): boolean {
  return currentMonthOrders < getPlanLimits(plan).ordersPerMonth
}
