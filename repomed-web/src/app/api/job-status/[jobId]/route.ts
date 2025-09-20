import { NextRequest, NextResponse } from 'next/server';

const CLAUDE_BRIDGE_URL = process.env.CLAUDE_BRIDGE_URL || 'http://localhost:8082';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Fetch job status from Claude Bridge
    const response = await fetch(`${CLAUDE_BRIDGE_URL}/job-status/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'kanban-board',
        'User-Agent': 'RepoMed-Kanban/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Job not found', jobId },
          { status: 404 }
        );
      }

      const errorText = await response.text();
      console.error('Claude Bridge job status error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch job status', details: errorText },
        { status: response.status }
      );
    }

    const jobData = await response.json();

    // Standardize the response format
    const standardizedResponse = {
      id: jobId,
      status: jobData.status || 'unknown',
      startedAt: jobData.startedAt || jobData.createdAt,
      completedAt: jobData.completedAt || jobData.finishedAt,
      logs: Array.isArray(jobData.logs) ? jobData.logs : [],
      result: jobData.result || jobData.output,
      error: jobData.error,
      progress: jobData.progress || 0,
      metadata: jobData.metadata || {}
    };

    return NextResponse.json(standardizedResponse);

  } catch (error) {
    console.error('Job status fetch error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        jobId: params.jobId
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Cancel job via Claude Bridge
    const response = await fetch(`${CLAUDE_BRIDGE_URL}/cancel-job/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'kanban-board',
        'User-Agent': 'RepoMed-Kanban/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to cancel job', details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Job cancelled successfully',
      result
    });

  } catch (error) {
    console.error('Job cancellation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}