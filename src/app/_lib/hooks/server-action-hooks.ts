import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import {
  setupServerActionHooks,
  createServerActionsKeyFactory,
} from 'zsa-react-query';

export const QueryKeyFactory = createServerActionsKeyFactory({
  getPosts: () => ['getUser'],
  getDashboardStats: () => ['getDashboardStats'],
  getSessionAccess: () => ['getSessionAccess'],
});

const {
  useServerActionQuery,
  useServerActionMutation,
  useServerActionInfiniteQuery,
} = setupServerActionHooks({
  hooks: {
    useQuery,
    useMutation,
    useInfiniteQuery,
  },
  queryKeyFactory: QueryKeyFactory,
});

export {
  useServerActionInfiniteQuery,
  useServerActionMutation,
  useServerActionQuery,
};
