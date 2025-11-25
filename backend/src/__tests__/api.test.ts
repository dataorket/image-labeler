import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { jobs } from '../store/jobsStore';
import type { UploadJob } from '../shared/types';

describe('API Endpoints', () => {
  beforeEach(() => {
    // Clear the jobs store before each test
    Object.keys(jobs).forEach(key => delete jobs[key]);
  });

  describe('GET /jobs/:id', () => {
    it('should return 404 when job does not exist', async () => {
      const response = await request(app)
        .get('/jobs/non-existent-id')
        .expect(404);

      expect(response.body).toEqual({ error: 'Job not found' });
    });

    it('should return job when it exists', async () => {
      const mockJob: UploadJob = {
        jobId: 'test-job-1',
        status: 'pending',
        images: [
          {
            imageId: 'img-1',
            filename: 'test.jpg',
            originalName: 'test.jpg',
            status: 'uploaded'
          }
        ],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };
      jobs['test-job-1'] = mockJob;

      const response = await request(app)
        .get('/jobs/test-job-1')
        .expect(200);

      expect(response.body).toEqual(mockJob);
    });
  });

  describe('GET /api/', () => {
    it('should return empty array when no jobs exist', async () => {
      const response = await request(app)
        .get('/api/')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all jobs sorted by creation date (newest first)', async () => {
      const job1: UploadJob = {
        jobId: 'job-1',
        status: 'done',
        images: [],
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z'
      };
      const job2: UploadJob = {
        jobId: 'job-2',
        status: 'pending',
        images: [],
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z'
      };
      const job3: UploadJob = {
        jobId: 'job-3',
        status: 'done',
        images: [],
        createdAt: '2024-01-01T11:00:00.000Z',
        updatedAt: '2024-01-01T11:00:00.000Z'
      };

      jobs['job-1'] = job1;
      jobs['job-2'] = job2;
      jobs['job-3'] = job3;

      const response = await request(app)
        .get('/api/')
        .expect(200);

      expect(response.body).toHaveLength(3);
      // Should be sorted: job2 (12:00), job3 (11:00), job1 (10:00)
      expect(response.body[0].jobId).toBe('job-2');
      expect(response.body[1].jobId).toBe('job-3');
      expect(response.body[2].jobId).toBe('job-1');
    });
  });

  describe('POST /api/', () => {
    it('should create a job and return it immediately', async () => {
      const response = await request(app)
        .post('/api/')
        .attach('images', Buffer.from('fake image content'), 'test1.jpg')
        .attach('images', Buffer.from('another fake image'), 'test2.png')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'pending',
        images: expect.arrayContaining([
          expect.objectContaining({
            originalName: 'test1.jpg',
            status: 'uploaded'
          }),
          expect.objectContaining({
            originalName: 'test2.png',
            status: 'uploaded'
          })
        ])
      });

      expect(response.body.jobId).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
      expect(response.body.images).toHaveLength(2);

      // Verify job was stored (status might be 'pending' or 'done' due to async processing)
      const storedJob = jobs[response.body.jobId];
      expect(storedJob).toBeDefined();
      expect(['pending', 'done']).toContain(storedJob.status);
    });

    it('should handle single image upload', async () => {
      const response = await request(app)
        .post('/api/')
        .attach('images', Buffer.from('single image'), 'single.jpg')
        .expect(200);

      expect(response.body.images).toHaveLength(1);
      expect(response.body.images[0].originalName).toBe('single.jpg');
    });

    it('should generate unique job IDs and image IDs', async () => {
      const response1 = await request(app)
        .post('/api/')
        .attach('images', Buffer.from('image1'), 'img1.jpg')
        .expect(200);

      const response2 = await request(app)
        .post('/api/')
        .attach('images', Buffer.from('image2'), 'img2.jpg')
        .expect(200);

      expect(response1.body.jobId).not.toBe(response2.body.jobId);
      expect(response1.body.images[0].imageId).not.toBe(response2.body.images[0].imageId);
    });
  });

  describe('CORS', () => {
    it('should have CORS headers enabled', async () => {
      const response = await request(app)
        .get('/api/')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
