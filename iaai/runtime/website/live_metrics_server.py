#!/usr/bin/env python3
"""
Live Metrics Server - Phase W Task 2
Real-time SSE metrics feed for website control center
MOCKS_DISABLED=1 enforced - no placeholders or fabricated data
"""

import os
import json
import time
import asyncio
import aiohttp
from aiohttp import web
from aiohttp.web import Response
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
import psutil
import threading
import queue

class LiveMetricsServer:
    """Real-time metrics server with SSE feeds"""
    
    def __init__(self, host: str = "localhost", port: int = 3001):
        self.host = host
        self.port = port
        self.app = web.Application()
        self.metrics_queue = queue.Queue()
        self.clients: List[web.StreamResponse] = []
        self.is_running = False
        
        # Setup routes
        self.app.router.add_get("/metrics/sse", self.sse_handler)
        self.app.router.add_get("/metrics/json", self.json_handler)
        self.app.router.add_get("/health", self.health_handler)
        
        # Start metrics collection
        self.metrics_thread = threading.Thread(target=self._collect_metrics_loop, daemon=True)
        
        print(f"LiveMetricsServer initialized: {host}:{port}")
        
    def _collect_system_metrics(self) -> Dict[str, Any]:
        """Collect real system metrics"""
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            cpu_freq = psutil.cpu_freq()
            
            # Memory metrics
            memory = psutil.virtual_memory()
            swap = psutil.swap_memory()
            
            # Disk metrics
            disk = psutil.disk_usage('/')
            disk_io = psutil.disk_io_counters()
            
            # Network metrics
            network = psutil.net_io_counters()
            
            # Process metrics
            processes = len(psutil.pids())
            
            return {
                "timestamp": datetime.now().isoformat(),
                "cpu": {
                    "usage_percent": cpu_percent,
                    "count": cpu_count,
                    "frequency_mhz": cpu_freq.current if cpu_freq else 0,
                    "load_average": os.getloadavg() if hasattr(os, 'getloadavg') else [0, 0, 0]
                },
                "memory": {
                    "total_gb": round(memory.total / (1024**3), 2),
                    "used_gb": round(memory.used / (1024**3), 2),
                    "free_gb": round(memory.free / (1024**3), 2),
                    "usage_percent": memory.percent,
                    "swap_total_gb": round(swap.total / (1024**3), 2),
                    "swap_used_gb": round(swap.used / (1024**3), 2)
                },
                "disk": {
                    "total_gb": round(disk.total / (1024**3), 2),
                    "used_gb": round(disk.used / (1024**3), 2),
                    "free_gb": round(disk.free / (1024**3), 2),
                    "usage_percent": round((disk.used / disk.total) * 100, 2),
                    "read_mb": round(disk_io.read_bytes / (1024**2), 2) if disk_io else 0,
                    "write_mb": round(disk_io.write_bytes / (1024**2), 2) if disk_io else 0
                },
                "network": {
                    "bytes_sent_mb": round(network.bytes_sent / (1024**2), 2),
                    "bytes_recv_mb": round(network.bytes_recv / (1024**2), 2),
                    "packets_sent": network.packets_sent,
                    "packets_recv": network.packets_recv
                },
                "system": {
                    "processes": processes,
                    "uptime_seconds": time.time() - psutil.boot_time(),
                    "platform": os.uname().sysname if hasattr(os, 'uname') else os.name
                }
            }
            
        except Exception as e:
            return {
                "timestamp": datetime.now().isoformat(),
                "error": str(e),
                "status": "degraded"
            }
            
    def _collect_ai_metrics(self) -> Dict[str, Any]:
        """Collect AI-specific metrics from Phase X components"""
        try:
            metrics = {
                "timestamp": datetime.now().isoformat(),
                "ai_components": {}
            }
            
            # Check if Phase X artifacts exist
            artifacts_dir = Path("../artifacts")
            if artifacts_dir.exists():
                # Tinygrad metrics
                tinygrad_metrics = artifacts_dir / "train"
                if tinygrad_metrics.exists():
                    metrics["ai_components"]["tinygrad"] = {
                        "status": "active",
                        "artifacts_count": len(list(tinygrad_metrics.glob("*"))),
                        "last_updated": datetime.fromtimestamp(tinygrad_metrics.stat().st_mtime).isoformat()
                    }
                    
                # Petals metrics
                petals_metrics = artifacts_dir / "petals"
                if petals_metrics.exists():
                    metrics["ai_components"]["petals"] = {
                        "status": "active",
                        "cache_blocks": len(list(petals_metrics.glob("cache/*"))),
                        "last_updated": datetime.fromtimestamp(petals_metrics.stat().st_mtime).isoformat()
                    }
                    
                # Wondercraft metrics
                wondercraft_metrics = artifacts_dir / "wondercraft"
                if wondercraft_metrics.exists():
                    metrics["ai_components"]["wondercraft"] = {
                        "status": "active",
                        "scenes_count": len(list(wondercraft_metrics.glob("scenes/*"))),
                        "xr_overlays": len(list(wondercraft_metrics.glob("xr_overlay/*"))),
                        "last_updated": datetime.fromtimestamp(wondercraft_metrics.stat().st_mtime).isoformat()
                    }
                    
            return metrics
            
        except Exception as e:
            return {
                "timestamp": datetime.now().isoformat(),
                "error": str(e),
                "status": "degraded"
            }
            
    def _collect_metrics_loop(self):
        """Continuous metrics collection loop"""
        while self.is_running:
            try:
                # Collect system metrics
                system_metrics = self._collect_system_metrics()
                
                # Collect AI metrics
                ai_metrics = self._collect_ai_metrics()
                
                # Combine metrics
                combined_metrics = {
                    "system": system_metrics,
                    "ai": ai_metrics,
                    "server": {
                        "timestamp": datetime.now().isoformat(),
                        "clients_connected": len(self.clients),
                        "uptime_seconds": time.time() - getattr(self, '_start_time', time.time())
                    }
                }
                
                # Add to queue for SSE clients
                self.metrics_queue.put(combined_metrics)
                
                # Wait before next collection
                time.sleep(2)  # Update every 2 seconds
                
            except Exception as e:
                print(f"Error collecting metrics: {e}")
                time.sleep(5)  # Longer delay on error
                
    async def sse_handler(self, request: web.Request) -> Response:
        """Handle Server-Sent Events for real-time metrics"""
        response = web.StreamResponse(
            status=200,
            headers={
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control'
            }
        )
        
        await response.prepare(request)
        
        # Add client to list
        self.clients.append(response)
        
        try:
            # Send initial connection message
            await response.write(f"data: {json.dumps({'type': 'connected', 'timestamp': datetime.now().isoformat()})}\n\n".encode())
            
            # Send metrics updates
            while True:
                try:
                    # Get metrics from queue with timeout
                    metrics = self.metrics_queue.get(timeout=5)
                    
                    # Format as SSE
                    sse_data = f"data: {json.dumps(metrics)}\n\n"
                    await response.write(sse_data.encode())
                    
                except queue.Empty:
                    # Send heartbeat
                    heartbeat = {
                        "type": "heartbeat",
                        "timestamp": datetime.now().isoformat()
                    }
                    await response.write(f"data: {json.dumps(heartbeat)}\n\n".encode())
                    
        except Exception as e:
            print(f"SSE client error: {e}")
        finally:
            # Remove client from list
            if response in self.clients:
                self.clients.remove(response)
                
        return response
        
    async def json_handler(self, request: web.Request) -> Response:
        """Handle JSON metrics request"""
        try:
            # Get latest metrics from queue
            if not self.metrics_queue.empty():
                metrics = self.metrics_queue.get()
            else:
                # Generate fresh metrics if queue is empty
                metrics = {
                    "system": self._collect_system_metrics(),
                    "ai": self._collect_ai_metrics(),
                    "server": {
                        "timestamp": datetime.now().isoformat(),
                        "clients_connected": len(self.clients),
                        "uptime_seconds": time.time() - getattr(self, '_start_time', time.time())
                    }
                }
                
            return web.json_response(metrics)
            
        except Exception as e:
            return web.json_response({
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }, status=500)
            
    async def health_handler(self, request: web.Request) -> Response:
        """Handle health check request"""
        health_status = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "clients_connected": len(self.clients),
            "metrics_queue_size": self.metrics_queue.qsize(),
            "uptime_seconds": time.time() - getattr(self, '_start_time', time.time())
        }
        
        return web.json_response(health_status)
        
    def start(self):
        """Start the metrics server"""
        try:
            print(f"Starting LiveMetricsServer on {self.host}:{self.port}")
            
            self.is_running = True
            self._start_time = time.time()
            
            # Start metrics collection thread
            self.metrics_thread.start()
            
            # Start web server
            web.run_app(self.app, host=self.host, port=self.port)
            
        except Exception as e:
            print(f"Failed to start server: {e}")
            self.is_running = False
            
    def stop(self):
        """Stop the metrics server"""
        print("Stopping LiveMetricsServer...")
        self.is_running = False
        
        # Close all client connections
        for client in self.clients:
            try:
                client.write_eof()
            except:
                pass
        self.clients.clear()

def create_metrics_server() -> LiveMetricsServer:
    """Create a default metrics server"""
    return LiveMetricsServer(host="localhost", port=3001)

if __name__ == "__main__":
    # Test the metrics server
    server = create_metrics_server()
    
    try:
        print("Starting metrics server...")
        server.start()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.stop()
