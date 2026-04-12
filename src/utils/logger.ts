type TLogLevel = 'info' | 'error';

type TLogPayload = {
  level: TLogLevel;
  event: string;
  correlationId: string;
  details?: Record<string, unknown>;
};

const stringifyLog = ({
  level,
  event,
  correlationId,
  details,
}: TLogPayload) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    correlationId,
    details,
  });
};

export const logInfo = (
  event: string,
  correlationId: string,
  details?: Record<string, unknown>,
) => {
  console.info(stringifyLog({ level: 'info', event, correlationId, details }));
};

export const logError = (
  event: string,
  correlationId: string,
  error: unknown,
  details?: Record<string, unknown>,
) => {
  const resolvedError =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : { message: 'unknown_error', value: error };

  console.error(
    stringifyLog({
      level: 'error',
      event,
      correlationId,
      details: {
        ...details,
        error: resolvedError,
      },
    }),
  );
};
