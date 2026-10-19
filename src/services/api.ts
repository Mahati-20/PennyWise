/**
 * Frontend API client communicating with the custom Express + SQLite backend.
 * Uses native fetch with credentials: 'include' for secure HTTP-only cookie sessions.
 */

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include', // Automatically passes and receives HTTP-only session cookies
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    signup: (body: { email: string; password: string; name: string; mode?: 'campus' | 'pro' }) =>
      request<{ user: { id: string; email: string; name: string; mode: string }; profile: any }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    login: (body: { email: string; password: string }) =>
      request<{ user: { id: string; email: string; name: string; mode: string }; profile: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    logout: () =>
      request<{ message: string }>('/auth/logout', {
        method: 'POST',
      }),

    getMe: () =>
      request<{ user: { id: string; email: string } | null; profile: any | null }>('/auth/me', {
        method: 'GET',
      }),
  },

  // Financial Data
  financials: {
    getAll: () =>
      request<{
        profile: any;
        transactions: any[];
        budgets: any[];
        goals: any[];
        events: any[];
        wishlist: any[];
      }>('/financials/all', {
        method: 'GET',
      }),

    updateProfile: (profileData: any) =>
      request<any>('/financials/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }),

    // Transactions
    addTransaction: (tx: any) =>
      request<any>('/financials/transactions', {
        method: 'POST',
        body: JSON.stringify(tx),
      }),

    editTransaction: (id: string, tx: any) =>
      request<any>(`/financials/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(tx),
      }),

    deleteTransaction: (id: string) =>
      request<{ success: boolean }>(`/financials/transactions/${id}`, {
        method: 'DELETE',
      }),

    // Budgets
    addBudget: (budget: any) =>
      request<any>('/financials/budgets', {
        method: 'POST',
        body: JSON.stringify(budget),
      }),

    editBudget: (id: string, budget: any) =>
      request<any>(`/financials/budgets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(budget),
      }),

    deleteBudget: (id: string) =>
      request<{ success: boolean }>(`/financials/budgets/${id}`, {
        method: 'DELETE',
      }),

    applyBatchBudgets: (budgets: any[]) =>
      request<any[]>('/financials/budgets/batch', {
        method: 'POST',
        body: JSON.stringify({ budgets }),
      }),

    // Goals
    addGoal: (goal: any) =>
      request<any>('/financials/goals', {
        method: 'POST',
        body: JSON.stringify(goal),
      }),

    editGoal: (id: string, goal: any) =>
      request<any>(`/financials/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(goal),
      }),

    deleteGoal: (id: string) =>
      request<{ success: boolean }>(`/financials/goals/${id}`, {
        method: 'DELETE',
      }),

    depositGoal: (id: string, amount: number) =>
      request<{ success: boolean; goalId: string; currentAmount: number; transactionId: string }>(
        `/financials/goals/${id}/deposit`,
        {
          method: 'POST',
          body: JSON.stringify({ amount }),
        }
      ),

    updateGoalAllocations: (allocations: Record<string, number>) =>
      request<{ success: boolean }>('/financials/goals/allocations', {
        method: 'POST',
        body: JSON.stringify({ allocations }),
      }),

    // Calendar
    addCalendarEvent: (event: any) =>
      request<any>('/financials/calendar', {
        method: 'POST',
        body: JSON.stringify(event),
      }),

    toggleCalendarEvent: (id: string) =>
      request<{ id: string; status: string }>(`/financials/calendar/${id}/toggle`, {
        method: 'PUT',
      }),

    deleteCalendarEvent: (id: string) =>
      request<{ success: boolean }>(`/financials/calendar/${id}`, {
        method: 'DELETE',
      }),

    // Wishlist
    saveWishlist: (item: any) =>
      request<any>('/financials/wishlist', {
        method: 'POST',
        body: JSON.stringify(item),
      }),

    deleteWishlist: (id: string) =>
      request<{ success: boolean }>(`/financials/wishlist/${id}`, {
        method: 'DELETE',
      }),
  },
};

