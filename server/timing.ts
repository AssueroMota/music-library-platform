import type { FastifyReply } from 'fastify'

// Timings contain only stage names and durations, never query text or account data.
export class RequestTiming {
  private readonly stages: string[] = []

  constructor(private readonly reply: FastifyReply) {}

  async measure<T>(stage: 'auth' | 'database' | 'storage' | 'login', action: () => Promise<T>) {
    const start = performance.now()
    try {
      return await action()
    } finally {
      this.stages.push(`${stage};dur=${(performance.now() - start).toFixed(1)}`)
      this.reply.header('Server-Timing', this.stages.join(', '))
    }
  }
}
