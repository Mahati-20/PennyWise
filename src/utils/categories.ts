import { CategoryInfo, UserMode } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  // Campus Categories
  { id: 'c-food', name: 'Food & Canteen', icon: 'Utensils', color: '#40D9D0', mode: 'campus' },
  { id: 'c-books', name: 'Books & Supplies', icon: 'BookOpen', color: '#B9A7FF', mode: 'campus' },
  { id: 'c-tech', name: 'Tech & Gadgets', icon: 'Laptop', color: '#5ED6A2', mode: 'campus' },
  { id: 'c-transit', name: 'Campus Transit', icon: 'Bus', color: '#F2C66D', mode: 'campus' },
  { id: 'c-outing', name: 'Outing & Hangouts', icon: 'PartyPopper', color: '#F08091', mode: 'campus' },
  { id: 'c-subs', name: 'Student Subscriptions', icon: 'Tv', color: '#38BDF8', mode: 'campus' },
  { id: 'c-hostel', name: 'Hostel & Living', icon: 'Home', color: '#A78BFA', mode: 'campus' },

  // Pro Categories
  { id: 'p-housing', name: 'Housing & Rent', icon: 'Home', color: '#40D9D0', mode: 'pro' },
  { id: 'p-groceries', name: 'Groceries & Dining', icon: 'Utensils', color: '#B9A7FF', mode: 'pro' },
  { id: 'p-utilities', name: 'Utilities & Bills', icon: 'Zap', color: '#F2C66D', mode: 'pro' },
  { id: 'p-transit', name: 'Transit & Fuel', icon: 'Car', color: '#38BDF8', mode: 'pro' },
  { id: 'p-invest', name: 'Investments & Savings', icon: 'TrendingUp', color: '#5ED6A2', mode: 'pro' },
  { id: 'p-health', name: 'Health & Wellness', icon: 'HeartPulse', color: '#F08091', mode: 'pro' },
  { id: 'p-entertainment', name: 'Entertainment & Leisure', icon: 'Film', color: '#F472B6', mode: 'pro' },
  { id: 'p-shopping', name: 'Shopping & Gear', icon: 'ShoppingBag', color: '#A78BFA', mode: 'pro' },

  // Common Categories
  { id: 'gen-income', name: 'Salary / Allowance', icon: 'Briefcase', color: '#5ED6A2', mode: 'all' },
  { id: 'gen-freelance', name: 'Stipend / Freelance', icon: 'Sparkles', color: '#40D9D0', mode: 'all' },
  { id: 'gen-other', name: 'Other / Misc', icon: 'MoreHorizontal', color: '#94A3B8', mode: 'all' },
];

export function getCategoriesForMode(mode: UserMode): CategoryInfo[] {
  return CATEGORIES.filter(cat => cat.mode === 'all' || cat.mode === mode);
}

export function getCategoryByName(name: string): CategoryInfo {
  const found = CATEGORIES.find(c => c.name.toLowerCase() === name.toLowerCase());
  return found || {
    id: 'unknown',
    name,
    icon: 'Tag',
    color: '#40D9D0',
    mode: 'all',
  };
}

