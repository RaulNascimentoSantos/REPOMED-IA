// Cliente para integração com Claude Code via Node-RED
interface JobStatus {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}

class ClaudeCodeClient {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:1880') {
    this.baseUrl = baseUrl;
  }

  async executeRequest(brief: string, priority: string = 'normal'): Promise<JobStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/claude/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brief, priority })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      // Start polling for status
      if (data.jobId) {
        return await this.pollJobStatus(data.jobId);
      }

      return data;
    } catch (error) {
      console.error('Claude Code request failed:', error);
      throw error;
    }
  }

  async pollJobStatus(jobId: string, maxAttempts: number = 30, intervalMs: number = 2000): Promise<JobStatus> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/claude/status/${jobId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Status check failed');
        }

        // Job completed
        if (data.status === 'completed') {
          return {
            success: true,
            jobId,
            ...data
          };
        }

        // Job failed
        if (data.status === 'failed') {
          return {
            success: false,
            jobId,
            error: 'Job execution failed',
            ...data
          };
        }

        // Job still running - continue polling
        console.log(`Job ${jobId} - Attempt ${attempt}/${maxAttempts}: ${data.status} (${data.progress || 0}%)`);

        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, intervalMs));
        }

      } catch (error) {
        console.error(`Polling attempt ${attempt} failed:`, error);

        if (attempt === maxAttempts) {
          throw error;
        }

        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }

    throw new Error(`Job ${jobId} timed out after ${maxAttempts} attempts`);
  }

  async getJobStatus(jobId: string): Promise<JobStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/claude/status/${jobId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Status check failed');
      }

      return data;
    } catch (error) {
      console.error('Status check failed:', error);
      throw error;
    }
  }
}

export default ClaudeCodeClient;

// Exemplo de uso:
/*
import ClaudeCodeClient from './utils/claudeCodeClient';

const client = new ClaudeCodeClient();

try {
  const result = await client.executeRequest(
    "Adicionar um novo campo 'email' na página de criação de pacientes",
    "high"
  );
  console.log('Execution completed:', result);
} catch (error) {
  console.error('Execution failed:', error);
}
*/