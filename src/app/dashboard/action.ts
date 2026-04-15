'use server';

import { createServerAction } from 'zsa';
import { DashboardService } from '@/services/dashboardService';
import { resolveDashboardAdminContext } from './_admin-auth';

export const getDashboardStats = createServerAction().handler(async () => {
  const adminContext = await resolveDashboardAdminContext();

  if (!adminContext) {
    throw new Error('Unauthorized - Invalid token');
  }

  try {
    const dashboardService = new DashboardService();
    const stats = await dashboardService.getDashboardStats();

    return stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
});
