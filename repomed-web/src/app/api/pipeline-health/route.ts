import { NextRequest, NextResponse } from 'next/server';

const CLAUDE_BRIDGE_URL = process.env.CLAUDE_BRIDGE_URL || 'http://localhost:8082';

export async function GET(request: NextRequest) {
  try {
    // Check Claude Bridge health
    const healthResponse = await fetch(`${CLAUDE_BRIDGE_URL}/health`, {
      method: 'GET',
      headers: {
        'User-Agent': 'RepoMed-Kanban/1.0'
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!healthResponse.ok) {
      return NextResponse.json({
        status: 'unhealthy',
        claudeBridge: 'down',
        timestamp: new Date().toISOString(),
        error: `Claude Bridge returned ${healthResponse.status}`
      }, { status: 503 });
    }

    const healthData = await healthResponse.json();

    // Get pipeline statistics
    const statsResponse = await fetch(`${CLAUDE_BRIDGE_URL}/pipeline-stats`, {
      method: 'GET',
      headers: {
        'User-Agent': 'RepoMed-Kanban/1.0'
      },
      signal: AbortSignal.timeout(5000)
    });

    let stats = {};
    if (statsResponse.ok) {
      stats = await statsResponse.json();
    }

    return NextResponse.json({
      status: 'healthy',
      claudeBridge: 'up',
      timestamp: new Date().toISOString(),
      services: {
        claudeBridge: {
          url: CLAUDE_BRIDGE_URL,
          status: healthData.status || 'ok',
          uptime: healthData.uptime || 'unknown',
          version: healthData.version || 'unknown'
        }
      },
      pipeline: {
        stats: stats,
        endpoints: [
          '/api/trigger-pipeline',
          '/api/job-status/[jobId]',
          '/api/pipeline-health'
        ]
      }
    });

  } catch (error) {
    console.error('Pipeline health check error:', error);

    return NextResponse.json({
      status: 'unhealthy',
      claudeBridge: 'down',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        claudeBridge: {
          url: CLAUDE_BRIDGE_URL,
          status: 'unreachable'
        }
      }
    }, { status: 503 });
  }
}