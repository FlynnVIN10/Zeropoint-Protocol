import { v4 as uuidv4 } from 'uuid';
import { checkIntent } from '../../guards/synthient.guard.js';
import { soulchain } from '../soulchain/soulchain.ledger.js';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
export class EnhancedPetalsClient {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new Logger(EnhancedPetalsClient.name);
        this.config = {
            apiUrl: this.configService.get('PETALS_API_URL') || 'https://api.petals.dev',
            apiKey: this.configService.get('PETALS_API_KEY') || '',
            timeout: this.configService.get('PETALS_TIMEOUT') || 30000,
            retryAttempts: this.configService.get('PETALS_RETRY_ATTEMPTS') || 3,
            batchSize: this.configService.get('PETALS_BATCH_SIZE') || 10,
            enableParallel: this.configService.get('PETALS_ENABLE_PARALLEL') || true
        };
    }
    async validateIntent(request, operation) {
        const intentString = `${operation}:${request.agentId}:${request.code.substring(0, 100)}:${JSON.stringify(request.tags)}`;
        if (!checkIntent(intentString)) {
            await this.logViolation(request, operation, 'Zeroth violation: Intent validation failed');
            return false;
        }
        const ethicalChecks = await Promise.all([
            this.checkCodeSafety(request.code),
            this.checkAgentPermissions(request.agentId),
            this.validateTags(request.tags)
        ]);
        const allChecksPassed = ethicalChecks.every(check => check);
        if (!allChecksPassed) {
            await this.logViolation(request, operation, 'Ethical validation failed');
            return false;
        }
        return true;
    }
    async checkCodeSafety(code) {
        const safetyChecks = await Promise.all([
            this.checkForMaliciousPatterns(code),
            this.checkForResourceAbuse(code),
            this.checkForPrivacyViolations(code)
        ]);
        return safetyChecks.every(check => check);
    }
    async checkForMaliciousPatterns(code) {
        const maliciousPatterns = [
            /eval\s*\(/,
            /exec\s*\(/,
            /system\s*\(/,
            /shell_exec\s*\(/,
            /passthru\s*\(/,
            /proc_open\s*\(/,
            /popen\s*\(/,
            /curl_exec\s*\(/,
            /file_get_contents\s*\(.*http/,
            /include\s*\(.*http/,
            /require\s*\(.*http/
        ];
        return !maliciousPatterns.some(pattern => pattern.test(code));
    }
    async checkForResourceAbuse(code) {
        const resourcePatterns = [
            /while\s*\(\s*true\s*\)/,
            /for\s*\(\s*;\s*;\s*\)/,
            /set_time_limit\s*\(\s*0\s*\)/,
            /memory_limit\s*=\s*['"]-1['"]/,
            /max_execution_time\s*=\s*['"]0['"]/
        ];
        return !resourcePatterns.some(pattern => pattern.test(code));
    }
    async checkForPrivacyViolations(code) {
        const privacyPatterns = [
            /password\s*=/,
            /api_key\s*=/,
            /secret\s*=/,
            /token\s*=/,
            /private_key\s*=/,
            /\.env/,
            /config\s*\[.*password/
        ];
        return !privacyPatterns.some(pattern => pattern.test(code));
    }
    async checkAgentPermissions(agentId) {
        return true;
    }
    async validateTags(tags) {
        return tags.every(tag => tag.type &&
            (tag.type === '#who' || tag.type === '#intent' || tag.type === '#thread' || tag.type === '#layer' || tag.type === '#domain'));
    }
    async logViolation(request, operation, reason) {
        await soulchain.addXPTransaction({
            agentId: request.agentId,
            amount: -10,
            rationale: `Petals violation: ${operation} - ${reason}`,
            timestamp: new Date().toISOString(),
            previousCid: null,
            tags: [
                {
                    type: '#who',
                    name: request.agentId,
                    did: `did:zeropoint:${request.agentId}`,
                    handle: `@${request.agentId}`
                },
                {
                    type: '#intent',
                    purpose: '#security-violation',
                    validation: 'halt'
                },
                {
                    type: '#thread',
                    taskId: operation,
                    lineage: ['petals', 'security'],
                    swarmLink: 'security-swarm'
                },
                {
                    type: '#layer',
                    level: '#live'
                },
                {
                    type: '#domain',
                    field: '#security'
                }
            ]
        });
    }
    async callPetalsAPI(request) {
        const startTime = Date.now();
        try {
            const isValid = await this.validateIntent(request, 'petals-single-call');
            if (!isValid) {
                throw new Error('Zeroth violation: Petals call blocked by enhanced validation.');
            }
            const enhancedRequest = {
                ...request,
                metadata: {
                    timestamp: new Date().toISOString(),
                    version: '2.0.0',
                    environment: this.configService.get('NODE_ENV') || 'development'
                }
            };
            const response = await this.makePetalsAPICall(enhancedRequest);
            const processingTime = Date.now() - startTime;
            await this.logSuccessfulOperation(request, response, processingTime);
            return {
                ...response,
                metadata: {
                    processingTime,
                    modelVersion: 'petals-v2.0',
                    confidence: response.trustScore
                }
            };
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            await this.logError(request, error, processingTime);
            throw error;
        }
    }
    async callPetalsBatch(batchRequest) {
        const startTime = Date.now();
        try {
            const validationPromises = batchRequest.requests.map(request => this.validateIntent(request, 'petals-batch-call'));
            const validationResults = await Promise.all(validationPromises);
            const validRequests = batchRequest.requests.filter((_, index) => validationResults[index]);
            if (validRequests.length === 0) {
                throw new Error('Zeroth violation: All batch requests blocked by validation.');
            }
            const processingPromises = validRequests.map(request => this.callPetalsAPI(request));
            const results = await Promise.all(processingPromises);
            const processingTime = Date.now() - startTime;
            const summary = this.calculateBatchSummary(results, batchRequest.requests.length);
            await this.logBatchOperation(batchRequest, results, summary, processingTime);
            return {
                batchId: batchRequest.batchId,
                results,
                summary,
                metadata: {
                    processingTime,
                    timestamp: new Date().toISOString()
                }
            };
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            await this.logBatchError(batchRequest, error, processingTime);
            throw error;
        }
    }
    async makePetalsAPICall(request) {
        let lastError;
        for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
            try {
                await new Promise(resolve => setTimeout(resolve, 100));
                return {
                    rewrittenCode: request.code,
                    trustScore: 0.9,
                    ethicalRating: 'aligned',
                    notes: [`Stub: auto-approved (attempt ${attempt})`]
                };
            }
            catch (error) {
                lastError = error;
                this.logger.warn(`Petals API call attempt ${attempt} failed: ${error.message}`);
                if (attempt < this.config.retryAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        }
        throw lastError || new Error('Petals API call failed after all retry attempts');
    }
    calculateBatchSummary(results, totalRequests) {
        const successCount = results.length;
        const failureCount = totalRequests - successCount;
        const averageTrustScore = results.reduce((sum, result) => sum + result.trustScore, 0) / successCount;
        const ethicalAlignment = results.filter(result => result.ethicalRating === 'aligned').length / successCount;
        return {
            totalProcessed: totalRequests,
            successCount,
            failureCount,
            averageTrustScore,
            ethicalAlignment
        };
    }
    async logSuccessfulOperation(request, response, processingTime) {
        await soulchain.addXPTransaction({
            agentId: request.agentId,
            amount: 5,
            rationale: `Petals operation successful: ${response.trustScore} trust score, ${processingTime}ms processing time`,
            timestamp: new Date().toISOString(),
            previousCid: null,
            tags: [
                {
                    type: '#who',
                    name: request.agentId,
                    did: `did:zeropoint:${request.agentId}`,
                    handle: `@${request.agentId}`
                },
                {
                    type: '#intent',
                    purpose: '#code-improvement',
                    validation: 'good-heart'
                },
                {
                    type: '#thread',
                    taskId: 'petals-operation',
                    lineage: ['petals', 'success'],
                    swarmLink: 'petals-swarm'
                },
                {
                    type: '#layer',
                    level: '#live'
                },
                {
                    type: '#domain',
                    field: '#ai'
                }
            ]
        });
    }
    async logError(request, error, processingTime) {
        await soulchain.addXPTransaction({
            agentId: request.agentId,
            amount: -5,
            rationale: `Petals operation failed: ${error.message}, ${processingTime}ms processing time`,
            timestamp: new Date().toISOString(),
            previousCid: null,
            tags: [
                {
                    type: '#who',
                    name: request.agentId,
                    did: `did:zeropoint:${request.agentId}`,
                    handle: `@${request.agentId}`
                },
                {
                    type: '#intent',
                    purpose: '#error-handling',
                    validation: 'neutral'
                },
                {
                    type: '#thread',
                    taskId: 'petals-error',
                    lineage: ['petals', 'error'],
                    swarmLink: 'error-swarm'
                },
                {
                    type: '#layer',
                    level: '#live'
                },
                {
                    type: '#domain',
                    field: '#error'
                }
            ]
        });
    }
    async logBatchOperation(batchRequest, results, summary, processingTime) {
        await soulchain.addXPTransaction({
            agentId: 'batch-processor',
            amount: summary.successCount * 2,
            rationale: `Batch operation: ${summary.successCount}/${summary.totalProcessed} successful, ${processingTime}ms total time`,
            timestamp: new Date().toISOString(),
            previousCid: null,
            tags: [
                {
                    type: '#who',
                    name: 'batch-processor',
                    did: 'did:zeropoint:batch-processor',
                    handle: '@batch-processor'
                },
                {
                    type: '#intent',
                    purpose: '#batch-processing',
                    validation: 'good-heart'
                },
                {
                    type: '#thread',
                    taskId: batchRequest.batchId,
                    lineage: ['petals', 'batch'],
                    swarmLink: 'batch-swarm'
                },
                {
                    type: '#layer',
                    level: '#live'
                },
                {
                    type: '#domain',
                    field: '#ai'
                }
            ]
        });
    }
    async logBatchError(batchRequest, error, processingTime) {
        await soulchain.addXPTransaction({
            agentId: 'batch-processor',
            amount: -10,
            rationale: `Batch operation failed: ${error.message}, ${processingTime}ms processing time`,
            timestamp: new Date().toISOString(),
            previousCid: null,
            tags: [
                {
                    type: '#who',
                    name: 'batch-processor',
                    did: 'did:zeropoint:batch-processor',
                    handle: '@batch-processor'
                },
                {
                    type: '#intent',
                    purpose: '#batch-error',
                    validation: 'halt'
                },
                {
                    type: '#thread',
                    taskId: batchRequest.batchId,
                    lineage: ['petals', 'batch-error'],
                    swarmLink: 'error-swarm'
                },
                {
                    type: '#layer',
                    level: '#live'
                },
                {
                    type: '#domain',
                    field: '#error'
                }
            ]
        });
    }
}
export function formatProposal(proposal) {
    return {
        id: uuidv4(),
        agentId: proposal.agentId,
        code: proposal.proposedCode,
        tags: proposal.tags
    };
}
export async function callPetalsAPI(request) {
    const client = new EnhancedPetalsClient(new HttpService(), new ConfigService());
    return client.callPetalsAPI(request);
}
export async function logTrainingCycle(agentId, summary) {
    await soulchain.addXPTransaction({
        agentId,
        amount: 1,
        rationale: `Training cycle logged: ${summary.trustScore} trust score`,
        timestamp: new Date().toISOString(),
        previousCid: null,
        tags: [
            {
                type: '#who',
                name: agentId,
                did: `did:zeropoint:${agentId}`,
                handle: `@${agentId}`
            },
            {
                type: '#intent',
                purpose: '#training-log',
                validation: 'good-heart'
            },
            {
                type: '#thread',
                taskId: 'training-cycle',
                lineage: ['training', 'log'],
                swarmLink: 'training-swarm'
            },
            {
                type: '#layer',
                level: '#live'
            },
            {
                type: '#domain',
                field: '#training'
            }
        ]
    });
}
//# sourceMappingURL=petals.bridge.js.map