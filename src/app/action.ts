'use server';

import { createServerAction } from 'zsa';
import { z } from 'zod';
import { UsersService } from '@/services/usersService';
import { cookies } from 'next/headers';
import { env } from '@/utils/env';

export const loginByClientId = createServerAction()
  .input(
    z.object({
      clientId: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const { clientId } = input;
    if (!clientId) {
      throw new Error('Client ID is required');
    }
    const usersService = new UsersService();
    const token = await usersService.retrieveUserById(parseInt(clientId));
    if (!token || typeof token !== 'string' || token.length === 0) {
      throw new Error('Error logging in user');
    }

    cookies().set('token', token, {
      httpOnly: true,
    });

    return {
      message: 'User logged in successfully',
      token,
    };
  });

export const logout = createServerAction().handler(() => {
  cookies().set('token', '', {
    httpOnly: true,
  });

  return {
    message: 'User logged out successfully',
  };
});

export const getSessionAccess = createServerAction().handler(async () => {
  const token = cookies().get('token')?.value;

  if (!token) {
    return {
      isAuthenticated: false,
      isAdmin: false,
    };
  }

  const usersService = new UsersService();
  const user = await usersService.verifyToken(token).catch(() => null);

  if (!user) {
    return {
      isAuthenticated: false,
      isAdmin: false,
    };
  }

  return {
    isAuthenticated: true,
    isAdmin: user.id === env.ADMIN_USER_ID,
  };
});
