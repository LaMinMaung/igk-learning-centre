/**
 * Users API — User management (admin)
 */
import { pb, apiCall } from './client';
import type { RecordModel, ListResult } from 'pocketbase';

export const usersApi = {
  /** List users (admin) */
  async list(page = 1, perPage = 30, filter = ''): Promise<ListResult<RecordModel>> {
    return apiCall(
      () => pb.collection('users').getList(page, perPage, {
        filter, sort: '-created', requestKey: null,
      }),
      'users.list',
    );
  },

  /** Get one user */
  async get(id: string): Promise<RecordModel> {
    return apiCall(
      () => pb.collection('users').getOne(id, { requestKey: null }),
      `users.get[${id}]`,
    );
  },

  /** Update user profile */
  async update(id: string, data: Record<string, unknown>): Promise<RecordModel> {
    return apiCall(() => pb.collection('users').update(id, data), `users.update[${id}]`);
  },

  /** Delete a user */
  async remove(id: string): Promise<boolean> {
    return apiCall(() => pb.collection('users').delete(id), `users.delete[${id}]`);
  },
};
