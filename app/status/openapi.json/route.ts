import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';


export async function GET(request: NextRequest) {
  try {
    const openApiSpec = {
      openapi: "3.0.3",
      info: {
        title: "Zeropoint Protocol API",
        description: "Stage 2 Synthient Services API with Dual-Consensus Governance",
        version: "2.0.0",
        contact: {
          name: "Zeropoint Protocol Dev Team",
          url: "https://zeropointprotocol.ai"
        }
      },
      servers: [
        {
          url: "https://zeropointprotocol.ai",
          description: "Production server"
        }
      ],
      paths: {
        "/status/synthients.json": {
          get: {
            summary: "Get Synthients Status",
            description: "Returns current status of all Synthient services",
            responses: {
              "200": {
                description: "Synthients status",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        phase: { type: "string" },
                        commit: { type: "string" },
                        services: { type: "object" },
                        governance: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/api/tinygrad/start": {
          post: {
            summary: "Start TinyGrad Training Job",
            description: "Initiates a new TinyGrad training job",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["config", "model"],
                    properties: {
                      config: { type: "object" },
                      model: { type: "string" },
                      dataset: { type: "string" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Training job started",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        jobId: { type: "string" },
                        status: { type: "string" },
                        message: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/api/tinygrad/status/{jobId}": {
          get: {
            summary: "Get TinyGrad Job Status",
            description: "Retrieves the status of a TinyGrad training job",
            parameters: [
              {
                name: "jobId",
                in: "path",
                required: true,
                schema: { type: "string" }
              }
            ],
            responses: {
              "200": {
                description: "Job status",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        jobId: { type: "string" },
                        status: { type: "string" },
                        progress: { type: "number" },
                        loss: { type: "string" },
                        accuracy: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/api/tinygrad/logs/{jobId}": {
          get: {
            summary: "Get TinyGrad Job Logs",
            description: "Retrieves logs for a TinyGrad training job",
            parameters: [
              {
                name: "jobId",
                in: "path",
                required: true,
                schema: { type: "string" }
              }
            ],
            responses: {
              "200": {
                description: "Job logs",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        jobId: { type: "string" },
                        logs: { type: "array", items: { type: "string" } },
                        totalLines: { type: "number" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/api/petals/propose": {
          post: {
            summary: "Create Petals Proposal",
            description: "Creates a new proposal in the Petals system",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["title", "description", "type", "proposer"],
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      type: { type: "string" },
                      parameters: { type: "object" },
                      proposer: { type: "string" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Proposal created",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        proposalId: { type: "string" },
                        status: { type: "string" },
                        message: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/api/petals/vote/{proposalId}": {
          post: {
            summary: "Vote on Petals Proposal",
            description: "Casts a vote on a Petals proposal",
            parameters: [
              {
                name: "proposalId",
                in: "path",
                required: true,
                schema: { type: "string" }
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["vote", "voter", "voterType"],
                    properties: {
                      vote: { type: "string", enum: ["for", "against", "abstain"] },
                      voter: { type: "string" },
                      voterType: { type: "string", enum: ["synthient", "human"] },
                      justification: { type: "string" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Vote recorded",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        proposalId: { type: "string" },
                        voteId: { type: "string" },
                        status: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/api/wondercraft/contribute": {
          post: {
            summary: "Contribute Wondercraft Asset",
            description: "Contributes a new asset to the Wondercraft system",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["asset", "sha256", "contributor", "assetType"],
                    properties: {
                      asset: { type: "object" },
                      sha256: { type: "string" },
                      contributor: { type: "string" },
                      assetType: { type: "string", enum: ["model", "dataset", "code", "documentation", "test"] },
                      metadata: { type: "object" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Asset contributed",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        contributionId: { type: "string" },
                        status: { type: "string" },
                        message: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/api/wondercraft/diff": {
          post: {
            summary: "Create Wondercraft Diff",
            description: "Creates a diff between two Wondercraft assets",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["originalAsset", "modifiedAsset", "diffType", "author"],
                    properties: {
                      originalAsset: { type: "object" },
                      modifiedAsset: { type: "object" },
                      diffType: { type: "string", enum: ["patch", "update", "revision", "fork"] },
                      author: { type: "string" },
                      description: { type: "string" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Diff created",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        diffId: { type: "string" },
                        status: { type: "string" },
                        message: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/api/governance/approval": {
          post: {
            summary: "Record Governance Approval",
            description: "Records dual-consensus approval for a PR",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["prNumber", "commitSha", "synthientApproval", "humanApproval"],
                    properties: {
                      prNumber: { type: "string" },
                      commitSha: { type: "string" },
                      synthientApproval: { type: "string", enum: ["approved", "rejected", "pending"] },
                      humanApproval: { type: "string", enum: ["approved", "rejected", "pending"] },
                      justification: { type: "object" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Approval recorded",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        approvalId: { type: "string" },
                        status: { type: "string" },
                        mergeEligible: { type: "boolean" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ],
      tags: [
        {
          name: "Status",
          description: "System status and health endpoints"
        },
        {
          name: "TinyGrad",
          description: "TinyGrad training lifecycle management"
        },
        {
          name: "Petals",
          description: "Petals proposals and voting system"
        },
        {
          name: "Wondercraft",
          description: "Wondercraft asset management"
        },
        {
          name: "Governance",
          description: "Dual-consensus governance system"
        }
      ]
    };

    return NextResponse.json(openApiSpec, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
        'X-OpenAPI-Version': '3.0.3'
      }
    });

  } catch (error) {
    console.error('OpenAPI spec error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
