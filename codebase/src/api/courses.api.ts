/**
 * Courses API — Course & lesson CRUD
 */
import { pb, apiCall } from './client';
import type { RecordModel, ListResult } from 'pocketbase';

export const coursesApi = {
  /** List courses (paginated) */
  async list(page = 1, perPage = 20, filter = ''): Promise<ListResult<RecordModel>> {
    return apiCall(
      () => pb.collection('courses').getList(page, perPage, {
        filter, sort: '-created', expand: 'teacher', requestKey: null,
      }),
      'courses.list',
    );
  },

  /** Get a single course with lessons */
  async get(id: string): Promise<RecordModel> {
    return apiCall(
      () => pb.collection('courses').getOne(id, {
        expand: 'teacher,lessons_via_course', requestKey: null,
      }),
      `courses.get[${id}]`,
    );
  },

  /** Create a course */
  async create(data: Record<string, unknown>): Promise<RecordModel> {
    return apiCall(() => pb.collection('courses').create(data), 'courses.create');
  },

  /** Update a course */
  async update(id: string, data: Record<string, unknown>): Promise<RecordModel> {
    return apiCall(() => pb.collection('courses').update(id, data), `courses.update[${id}]`);
  },

  /** Delete a course */
  async remove(id: string): Promise<boolean> {
    return apiCall(() => pb.collection('courses').delete(id), `courses.delete[${id}]`);
  },

  /** List lessons for a course */
  async lessons(courseId: string): Promise<RecordModel[]> {
    return apiCall(
      () => pb.collection('lessons').getFullList({
        filter: pb.filter('course = {:id}', { id: courseId }),
        sort: 'order', requestKey: null,
      }),
      `lessons.byCourse[${courseId}]`,
    );
  },
};
