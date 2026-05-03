export type PlanId = "starter" | "pro" | "enterprise"

export const PLAN_LIMITS: Record<PlanId, { stores: number; ordersPerMonth: number; label: string; price: number }> = {
  starter:    { stores: 1,         ordersPerMonth: 500,        label: "Starter",    price: 29 },
  pro:        { stores: 3,         ordersPerMonth: 2000,       label: "Pro",        price: 59 },
  enterprise: { stores: Infinity,  ordersPerMonth: Infinity,   label: "Enterprise", price: 89 },
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
