import { dbConnectionManager } from '../lib/backend/database-connection-manager'
import { apiClientManager } from '../lib/backend/api-client-manager'

describe('Backend Integration Tests', () => {
  beforeAll(async () => {
    // Initialize backend connections
    await dbConnectionManager.getConnection('tinygrad')
    await dbConnectionManager.getConnection('petals')
    await dbConnectionManager.getConnection('wondercraft')
  })

  afterAll(async () => {
    // Clean up connections
    await dbConnectionManager.closeAllConnections()
  })

  describe('Database Connections', () => {
    test('Tinygrad database connection', async () => {
      const isConnected = await dbConnectionManager.testConnection('tinygrad')
      expect(isConnected).toBe(true)
    })

    test('Petals database connection', async () => {
      const isConnected = await dbConnectionManager.testConnection('petals')
      expect(isConnected).toBe(true)
    })

    test('Wondercraft database connection', async () => {
      const isConnected = await dbConnectionManager.testConnection('wondercraft')
      expect(isConnected).toBe(true)
    })
  })

  describe('API Client Connections', () => {
    test('Tinygrad API client', async () => {
      const client = await apiClientManager.getClient('tinygrad')
      const isHealthy = await client.healthCheck()
      expect(isHealthy).toBe(true)
    })

    test('Petals API client', async () => {
      const client = await apiClientManager.getClient('petals')
      const isHealthy = await client.healthCheck()
      expect(isHealthy).toBe(true)
    })

    test('Wondercraft API client', async () => {
      const client = await apiClientManager.getClient('wondercraft')
      const isHealthy = await client.healthCheck()
      expect(isHealthy).toBe(true)
    })
  })

  describe('End-to-End Integration', () => {
    test('Tinygrad training job flow', async () => {
      const client = await apiClientManager.getClient('tinygrad')
      
      // Test training job creation
      const jobData = {
        modelName: 'test-model',
        datasetPath: '/test/dataset',
        hyperparameters: { epochs: 10, batchSize: 32 }
      }
      
      const response = await client.request('/api/training/start', {
        method: 'POST',
        body: JSON.stringify(jobData)
      })
      
      expect(response).toHaveProperty('jobId')
      expect(response).toHaveProperty('status')
    })

    test('Petals proposal flow', async () => {
      const client = await apiClientManager.getClient('petals')
      
      // Test proposal creation
      const proposalData = {
        title: 'Test Proposal',
        description: 'Test description',
        type: 'governance',
        data: { test: true }
      }
      
      const response = await client.request('/api/proposals', {
        method: 'POST',
        body: JSON.stringify(proposalData)
      })
      
      expect(response).toHaveProperty('proposalId')
      expect(response).toHaveProperty('status')
    })

    test('Wondercraft contribution flow', async () => {
      const client = await apiClientManager.getClient('wondercraft')
      
      // Test contribution creation
      const contributionData = {
        title: 'Test Contribution',
        description: 'Test description',
        assetType: 'code',
        content: 'test content'
      }
      
      const response = await client.request('/api/contributions', {
        method: 'POST',
        body: JSON.stringify(contributionData)
      })
      
      expect(response).toHaveProperty('contributionId')
      expect(response).toHaveProperty('status')
    })
  })
})
