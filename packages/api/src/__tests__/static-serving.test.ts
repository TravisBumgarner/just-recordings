import request from 'supertest'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

describe('Static file serving', () => {
  describe('in production mode', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'production')
      vi.resetModules()
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('API routes still work correctly', async () => {
      // Re-import app with production env
      const { app } = await import('../app.js')

      const response = await request(app).get('/api/health')
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: 'ok' })
    })

    it('non-API routes return index.html as SPA fallback', async () => {
      const { app } = await import('../app.js')

      // Request a non-API route that would be handled by the SPA
      const response = await request(app).get('/some/spa/route')

      // Should return 200 with HTML content (the index.html)
      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toMatch(/text\/html/)
    })
  })

  describe('in development mode', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'development')
      vi.resetModules()
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('API routes work correctly', async () => {
      const { app } = await import('../app.js')

      const response = await request(app).get('/api/health')
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ status: 'ok' })
    })

    it('non-API routes return 404 (no SPA fallback)', async () => {
      const { app } = await import('../app.js')

      const response = await request(app).get('/some/spa/route')

      // In development, non-API routes should 404 (Vite serves the frontend separately)
      expect(response.status).toBe(404)
    })
  })
})
