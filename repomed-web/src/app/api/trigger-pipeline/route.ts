import { NextRequest, NextResponse } from 'next/server';
import { withOptionalAuth } from '../../../middleware/auth';

const CLAUDE_BRIDGE_URL = process.env.CLAUDE_BRIDGE_URL || 'http://localhost:8082';

export const POST = withOptionalAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { task, jobId, action } = body;

    // Validate required fields
    if (!task || !jobId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: task, jobId, action' },
        { status: 400 }
      );
    }

    // Prepare pipeline payload
    const pipelinePayload = {
      jobId,
      action,
      metadata: {
        taskId: task.id,
        taskTitle: task.title,
        taskStatus: task.status,
        priority: task.priority,
        assignee: task.assignee,
        timestamp: new Date().toISOString(),
        userId: user?.sub,
        userEmail: user?.email,
        userRole: user?.role
      },
      context: {
        source: 'kanban_board',
        trigger: 'task_status_change',
        boardState: {
          taskCount: 1,
          fromStatus: task.previousStatus || 'unknown',
          toStatus: task.status
        }
      },
      payload: task
    };

    // Send request to Claude Bridge
    const response = await fetch(`${CLAUDE_BRIDGE_URL}/trigger-pipeline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'kanban-board',
        'User-Agent': 'RepoMed-Kanban/1.0'
      },
      body: JSON.stringify(pipelinePayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude Bridge error:', errorText);
      return NextResponse.json(
        { error: 'Pipeline trigger failed', details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      jobId,
      pipelineResponse: result,
      message: 'Pipeline triggered successfully'
    });

  } catch (error) {
    console.error('Pipeline trigger error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/trigger-pipeline',
    methods: ['POST'],
    description: 'Triggers AI pipeline for completed Kanban tasks',
    status: 'active'
  });
}