#!/usr/bin/env python3
"""
API Server - Phase R Implementation
Public API endpoints for health, version, and system status
MOCKS_DISABLED=1 enforced - no placeholders or fabricated data
"""

import os
import json
import time
import asyncio
import aiohttp
from aiohttp import web
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime
import psutil
import platform
import subprocess

class APIServer:
    """Public API server for system endpoints"""
    
    def __init__(self, host: str = "0.0.0.0", port: int = 8080):
        self.host = host
        self.port = port
        self.app = web.Application()
        self.start_time = time.time()
        
        # Setup routes
        self.setup_routes()
        
        # Security headers
        self.app.middlewares.append(self.security_middleware)
        
        print(f"APIServer initialized: {host}:{port}")
        
    def setup_routes(self):
        """Setup API routes"""
        # Health endpoints
        self.app.router.add_get("/healthz", self.healthz_handler)
        self.app.router.add_get("/readyz", self.readyz_handler)
        self.app.router.add_get("/livez", self.livez_handler)
        
        # Version and status endpoints
        self.app.router.add_get("/api/status/version", self.version_handler)
        self.app.router.add_get("/api/status/system", self.system_status_handler)
        self.app.router.add_get("/api/status/ai", self.ai_status_handler)
        
        # Metrics endpoints
        self.app.router.add_get("/api/metrics/system", self.system_metrics_handler)
        self.app.router.add_get("/api/metrics/ai", self.ai_metrics_handler)
        
        # Root endpoint
        self.app.router.add_get("/", self.root_handler)
        
    async def security_middleware(self, request, handler):
        """Security middleware for all endpoints"""
        response = await handler(request)
        
        # Security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        
        return response
        
    async def root_handler(self, request: web.Request) -> web.Response:
        """Root endpoint with API information"""
        api_info = {
            "name": "Zeropoint Protocol API",
            "version": "1.0.0",
            "description": "Public API for system status and monitoring",
            "endpoints": {
                "health": "/healthz, /readyz, /livez",
                "status": "/api/status/version, /api/status/system, /api/status/ai",
                "metrics": "/api/metrics/system, /api/metrics/ai"
            },
            "timestamp": datetime.now().isoformat(),
            "uptime_seconds": time.time() - self.start_time
        }
        
        return web.json_response(api_info)
        
    async def healthz_handler(self, request: web.Request) -> web.Response:
        """Health check endpoint (Kubernetes style)"""
        try:
            # Basic health checks
            health_status = {
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "uptime_seconds": time.time() - self.start_time,
                "checks": {}
            }
            
            # System health checks
            try:
                # CPU check
                cpu_percent = psutil.cpu_percent(interval=0.1)
                health_status["checks"]["cpu"] = {
                    "status": "healthy" if cpu_percent < 95 else "degraded",
                    "value": cpu_percent,
                    "threshold": 95
                }
                
                # Memory check
                memory = psutil.virtual_memory()
                health_status["checks"]["memory"] = {
                    "status": "healthy" if memory.percent < 90 else "degraded",
                    "value": memory.percent,
                    "threshold": 90
                }
                
                # Disk check
                disk = psutil.disk_usage('/')
                disk_percent = (disk.used / disk.total) * 100
                health_status["checks"]["disk"] = {
                    "status": "healthy" if disk_percent < 90 else "degraded",
                    "value": disk_percent,
                    "threshold": 90
                }
                
            except Exception as e:
                health_status["checks"]["system"] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
            
            # Overall status
            all_healthy = all(check.get("status") == "healthy" for check in health_status["checks"].values())
            health_status["status"] = "healthy" if all_healthy else "degraded"
            
            status_code = 200 if all_healthy else 503
            return web.json_response(health_status, status=status_code)
            
        except Exception as e:
            error_response = {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
            return web.json_response(error_response, status=500)
            
    async def readyz_handler(self, request: web.Request) -> web.Response:
        """Readiness check endpoint (Kubernetes style)"""
        try:
            # Check if system is ready to serve requests
            ready_status = {
                "status": "ready",
                "timestamp": datetime.now().isoformat(),
                "uptime_seconds": time.time() - self.start_time,
                "checks": {}
            }
            
            # Check if API server is ready
            ready_status["checks"]["api_server"] = {
                "status": "ready",
                "uptime_seconds": time.time() - self.start_time
            }
            
            # Check if Phase X components are available
            artifacts_dir = Path("../artifacts")
            if artifacts_dir.exists():
                ready_status["checks"]["phase_x_artifacts"] = {
                    "status": "ready",
                    "components": []
                }
                
                # Check individual components
                for component in ["train", "petals", "wondercraft"]:
                    component_path = artifacts_dir / component
                    if component_path.exists():
                        ready_status["checks"]["phase_x_artifacts"]["components"].append({
                            "name": component,
                            "status": "ready",
                            "last_updated": datetime.fromtimestamp(component_path.stat().st_mtime).isoformat()
                        })
                    else:
                        ready_status["checks"]["phase_x_artifacts"]["components"].append({
                            "name": component,
                            "status": "not_ready",
                            "reason": "artifacts not found"
                        })
            else:
                ready_status["checks"]["phase_x_artifacts"] = {
                    "status": "not_ready",
                    "reason": "artifacts directory not found"
                }
            
            # Overall readiness
            all_ready = all(check.get("status") == "ready" for check in ready_status["checks"].values())
            ready_status["status"] = "ready" if all_ready else "not_ready"
            
            status_code = 200 if all_ready else 503
            return web.json_response(ready_status, status=status_code)
            
        except Exception as e:
            error_response = {
                "status": "not_ready",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
            return web.json_response(error_response, status=500)
            
    async def livez_handler(self, request: web.Request) -> web.Response:
        """Liveness check endpoint (Kubernetes style)"""
        try:
            # Simple liveness check - if we can respond, we're alive
            live_status = {
                "status": "alive",
                "timestamp": datetime.now().isoformat(),
                "uptime_seconds": time.time() - self.start_time,
                "pid": os.getpid(),
                "platform": platform.platform()
            }
            
            return web.json_response(live_status, status=200)
            
        except Exception as e:
            error_response = {
                "status": "not_alive",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
            return web.json_response(error_response, status=500)
            
    async def version_handler(self, request: web.Request) -> web.Response:
        """Version information endpoint"""
        try:
            version_info = {
                "version": "1.0.0",
                "build_date": "2025-08-13",
                "git_commit": self._get_git_commit(),
                "git_branch": self._get_git_branch(),
                "platform": platform.platform(),
                "python_version": platform.python_version(),
                "timestamp": datetime.now().isoformat()
            }
            
            return web.json_response(version_info, status=200)
            
        except Exception as e:
            error_response = {
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
            return web.json_response(error_response, status=500)
            
    async def system_status_handler(self, request: web.Request) -> web.Response:
        """System status endpoint"""
        try:
            system_status = {
                "timestamp": datetime.now().isoformat(),
                "system": {
                    "platform": platform.platform(),
                    "machine": platform.machine(),
                    "processor": platform.processor(),
                    "python_version": platform.python_version()
                },
                "resources": {
                    "cpu_count": psutil.cpu_count(),
                    "memory_total_gb": round(psutil.virtual_memory().total / (1024**3), 2),
                    "disk_total_gb": round(psutil.disk_usage('/').total / (1024**3), 2)
                },
                "uptime": {
                    "system_uptime_seconds": time.time() - psutil.boot_time(),
                    "api_uptime_seconds": time.time() - self.start_time
                }
            }
            
            return web.json_response(system_status, status=200)
            
        except Exception as e:
            error_response = {
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
            return web.json_response(error_response, status=500)
            
    async def ai_status_handler(self, request: web.Request) -> web.Response:
        """AI components status endpoint"""
        try:
            ai_status = {
                "timestamp": datetime.now().isoformat(),
                "components": {}
            }
            
            # Check Phase X components
            artifacts_dir = Path("../artifacts")
            if artifacts_dir.exists():
                for component in ["train", "petals", "wondercraft"]:
                    component_path = artifacts_dir / component
                    if component_path.exists():
                        # Get component info
                        try:
                            stats = component_path.stat()
                            ai_status["components"][component] = {
                                "status": "active",
                                "last_updated": datetime.fromtimestamp(stats.st_mtime).isoformat(),
                                "size_bytes": stats.st_size,
                                "artifacts_count": len(list(component_path.glob("*")))
                            }
                        except Exception as e:
                            ai_status["components"][component] = {
                                "status": "error",
                                "error": str(e)
                            }
                    else:
                        ai_status["components"][component] = {
                            "status": "inactive",
                            "reason": "artifacts not found"
                        }
            else:
                ai_status["components"] = {
                    "status": "inactive",
                    "reason": "artifacts directory not found"
                }
            
            return web.json_response(ai_status, status=200)
            
        except Exception as e:
            error_response = {
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
            return web.json_response(error_response, status=500)
            
    async def system_metrics_handler(self, request: web.Request) -> web.Response:
        """System metrics endpoint"""
        try:
            # Collect current system metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            system_metrics = {
                "timestamp": datetime.now().isoformat(),
                "cpu": {
                    "usage_percent": cpu_percent,
                    "count": psutil.cpu_count(),
                    "frequency_mhz": psutil.cpu_freq().current if psutil.cpu_freq() else 0
                },
                "memory": {
                    "total_gb": round(memory.total / (1024**3), 2),
                    "used_gb": round(memory.used / (1024**3), 2),
                    "free_gb": round(memory.free / (1024**3), 2),
                    "usage_percent": memory.percent
                },
                "disk": {
                    "total_gb": round(disk.total / (1024**3), 2),
                    "used_gb": round(disk.used / (1024**3), 2),
                    "free_gb": round(disk.free / (1024**3), 2),
                    "usage_percent": round((disk.used / disk.total) * 100, 2)
                }
            }
            
            return web.json_response(system_metrics, status=200)
            
        except Exception as e:
            error_response = {
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
            return web.json_response(error_response, status=500)
            
    async def ai_metrics_handler(self, request: web.Request) -> web.Response:
        """AI metrics endpoint"""
        try:
            ai_metrics = {
                "timestamp": datetime.now().isoformat(),
                "components": {}
            }
            
            # Check Phase X artifacts
            artifacts_dir = Path("../artifacts")
            if artifacts_dir.exists():
                for component in ["train", "petals", "wondercraft"]:
                    component_path = artifacts_dir / component
                    if component_path.exists():
                        try:
                            stats = component_path.stat()
                            ai_metrics["components"][component] = {
                                "status": "active",
                                "last_updated": datetime.fromtimestamp(stats.st_mtime).isoformat(),
                                "size_bytes": stats.st_size,
                                "artifacts_count": len(list(component_path.glob("*")))
                            }
                        except Exception as e:
                            ai_metrics["components"][component] = {
                                "status": "error",
                                "error": str(e)
                            }
                    else:
                        ai_metrics["components"][component] = {
                            "status": "inactive"
                        }
            
            return web.json_response(ai_metrics, status=200)
            
        except Exception as e:
            error_response = {
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
            return web.json_response(error_response, status=500)
            
    def _get_git_commit(self) -> str:
        """Get current git commit hash"""
        try:
            result = subprocess.run(['git', 'rev-parse', 'HEAD'], 
                                 capture_output=True, text=True, cwd='..')
            if result.returncode == 0:
                return result.stdout.strip()[:8]  # First 8 characters
        except:
            pass
        return "unknown"
        
    def _get_git_branch(self) -> str:
        """Get current git branch"""
        try:
            result = subprocess.run(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], 
                                 capture_output=True, text=True, cwd='..')
            if result.returncode == 0:
                return result.stdout.strip()
        except:
            pass
        return "unknown"
        
    def start(self):
        """Start the API server"""
        try:
            print(f"Starting APIServer on {self.host}:{self.port}")
            web.run_app(self.app, host=self.host, port=self.port)
        except Exception as e:
            print(f"Failed to start server: {e}")

def create_api_server() -> APIServer:
    """Create a default API server"""
    return APIServer(host="0.0.0.0", port=8080)

if __name__ == "__main__":
    # Test the API server
    server = create_api_server()
    
    try:
        print("Starting API server...")
        server.start()
    except KeyboardInterrupt:
        print("\nShutting down...")
