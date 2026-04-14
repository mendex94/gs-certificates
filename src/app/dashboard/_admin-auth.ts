import { cookies } from 'next/headers';
import { UsersService } from '@/services/usersService';
import { env } from '@/utils/env';

type TDashboardAdminContext = {
  userId: number;
};

export const resolveDashboardAdminContext =
  async (): Promise<TDashboardAdminContext | null> => {
    const token = cookies().get('token')?.value;

    if (!token) {
      return null;
    }

    const usersService = new UsersService();
    const user = await usersService.verifyToken(token).catch(() => null);

    return user?.id === env.ADMIN_USER_ID ? { userId: user.id } : null;
  };
