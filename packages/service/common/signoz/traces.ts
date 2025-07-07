import { registerOTel, OTLPHttpJsonTraceExporter } from '@vercel/otel';
// Add otel logging
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { signozBaseUrl, signozServiceName } from './constants';
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR); // set diaglog level to DEBUG when debugging

export function registerSignozTraces() {
  if (!signozBaseUrl) return;

  console.log('Start signoz monitor', {
    signozBaseUrl,
    signozServiceName
  });

  registerOTel({
    serviceName: signozServiceName,
    traceExporter: new OTLPHttpJsonTraceExporter({
      url: `${signozBaseUrl}/v1/traces`
    })
  });
}
