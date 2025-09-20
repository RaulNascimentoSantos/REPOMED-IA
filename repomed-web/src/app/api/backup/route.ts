import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, metadata } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type, data' },
        { status: 400 }
      );
    }

    // Generate backup filename with timestamp
    const timestamp = format(new Date(), 'yyyy-MM-dd-HH-mm-ss');
    const filename = `${type}_backup_${timestamp}.json`;

    // Create backup object
    const backup = {
      version: '1.0',
      type,
      timestamp: new Date().toISOString(),
      metadata: {
        userAgent: request.headers.get('user-agent') || 'Unknown',
        clientId: metadata?.clientId || 'anonymous',
        source: metadata?.source || 'manual',
        ...metadata
      },
      data
    };

    // In a real implementation, you would save this to a database or cloud storage
    // For now, we'll return the backup data to be saved client-side
    return NextResponse.json({
      success: true,
      backup: {
        filename,
        size: JSON.stringify(backup).length,
        timestamp: backup.timestamp,
        type,
        checksum: generateChecksum(JSON.stringify(backup))
      },
      downloadUrl: `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backup, null, 2))}`
    });

  } catch (error) {
    console.error('Backup creation error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');

    // In a real implementation, you would query your backup storage
    // For now, return mock backup history
    const mockBackups = Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      id: `backup_${Date.now() - i * 86400000}`,
      filename: `${type || 'kanban'}_backup_${format(new Date(Date.now() - i * 86400000), 'yyyy-MM-dd-HH-mm-ss')}.json`,
      type: type || 'kanban',
      timestamp: new Date(Date.now() - i * 86400000).toISOString(),
      size: Math.floor(Math.random() * 50000 + 10000),
      checksum: generateChecksum(`mock_data_${i}`),
      metadata: {
        source: 'auto',
        clientId: 'system',
        itemCount: Math.floor(Math.random() * 100 + 10)
      }
    }));

    return NextResponse.json({
      success: true,
      backups: mockBackups,
      total: mockBackups.length,
      type: type || 'all'
    });

  } catch (error) {
    console.error('Backup list error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const backupId = searchParams.get('id');

    if (!backupId) {
      return NextResponse.json(
        { error: 'Missing backup ID' },
        { status: 400 }
      );
    }

    // In a real implementation, you would delete the backup from storage
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully',
      backupId
    });

  } catch (error) {
    console.error('Backup deletion error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateChecksum(data: string): string {
  // Simple checksum implementation
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}