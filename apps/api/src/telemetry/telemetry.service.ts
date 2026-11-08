import { Injectable, Logger } from '@nestjs/common';
import { trace, Span, SpanStatusCode } from '@opentelemetry/api';

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);
  private readonly tracer = trace.getTracer('khojsetu-api', '2.0.0');

  /**
   * Start a new OpenTelemetry span for tracing
   */
  startSpan(name: string, attributes: Record<string, any> = {}): Span {
    const span = this.tracer.startSpan(name);
    for (const [key, value] of Object.entries(attributes)) {
      if (value !== undefined && value !== null) {
        span.setAttribute(key, typeof value === 'object' ? JSON.stringify(value) : value);
      }
    }
    return span;
  }

  /**
   * Trace an asynchronous function call with error handling and metrics recording
   */
  async traceAsync<T>(name: string, fn: (span: Span) => Promise<T>, attributes: Record<string, any> = {}): Promise<T> {
    const span = this.startSpan(name, attributes);
    const start = performance.now();
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message || 'Error occurred during execution'
      });
      throw error;
    } finally {
      const durationMs = (performance.now() - start).toFixed(2);
      span.setAttribute('execution.duration_ms', durationMs);
      span.end();
    }
  }

  recordMetric(metricName: string, value: number, tags: Record<string, string> = {}) {
    // OpenTelemetry Metrics hook
    this.logger.debug(`[OTel Metric] ${metricName}: ${value} ${JSON.stringify(tags)}`);
  }
}
