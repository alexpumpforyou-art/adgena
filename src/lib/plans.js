// Centralized plan definitions — single source of truth
// Used by: checkout, result, recurring, admin, profile, dashboard

export const PLANS = {
  test:     { id: 'test',     name: 'Тест',      price: 1,    limit: 1,   description: '1 генерация (тест)', recurringHours: 1 },
  trial3:   { id: 'trial3',   name: 'Пробный',   price: 90,   limit: 3,   description: '3 генерации / нед', recurringDays: 7 },
  lite:     { id: 'lite',     name: 'Лайт',     price: 390,  limit: 10,  description: '10 генераций / мес' },
  standard: { id: 'standard', name: 'Стандарт',  price: 990,  limit: 30,  description: '30 генераций / мес' },
  pro:      { id: 'pro',      name: 'Про',       price: 2490, limit: 80,  description: '80 генераций / мес' },
  business: { id: 'business',  name: 'Бизнес',    price: 4990, limit: 200, description: '200 генераций / мес' },
};

export function getPlan(planId) {
  return PLANS[planId] || null;
}

export function getPlanLimit(planId) {
  return PLANS[planId]?.limit || 1;
}
