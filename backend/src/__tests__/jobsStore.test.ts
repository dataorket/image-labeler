import { describe, it, expect, beforeEach } from 'vitest';
import { jobs } from '../store/jobsStore';
import { UploadJob } from '../shared/types';

describe('Job Store', () => {
  beforeEach(() => {
    // Clear jobs before each test
    Object.keys(jobs).forEach(key => delete jobs[key]);
  });

  it('should be an empty object initially after clearing', () => {
    expect(Object.keys(jobs)).toHaveLength(0);
  });

  it('should allow adding jobs', () => {
    const jobId = 'test-job-123';
    const testJob: UploadJob = {
      jobId,
      status: 'pending',
      images: [{
        imageId: 'img-1',
        filename: 'uuid-test.jpg',
        originalName: 'test.jpg',
        status: 'uploaded'
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    jobs[jobId] = testJob;

    expect(jobs[jobId]).toBeDefined();
    expect(jobs[jobId].status).toBe('pending');
    expect(jobs[jobId].images).toHaveLength(1);
  });

  it('should allow retrieving jobs by ID', () => {
    const jobId = 'retrieve-test-456';
    jobs[jobId] = {
      jobId,
      status: 'done',
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const retrieved = jobs[jobId];
    expect(retrieved).toBeDefined();
    expect(retrieved.jobId).toBe(jobId);
    expect(retrieved.status).toBe('done');
  });
  
  it('should allow updating job status', () => {
    const jobId = 'update-test-789';
    jobs[jobId] = {
      jobId,
      status: 'pending',
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    jobs[jobId].status = 'processing';
    expect(jobs[jobId].status).toBe('processing');
    
    jobs[jobId].status = 'done';
    expect(jobs[jobId].status).toBe('done');
  });
});
