import { expect, type ConsoleMessage, type Page, type Request, type Response } from '@playwright/test';

export interface DetectedHttpError {
  method: string;
  url: string;
  status: number;
  statusText: string;
  bodyPreview?: string;
}

export interface DetectedRequestFailure {
  method: string;
  url: string;
  failureText: string;
}

export interface ErrorMonitorOptions {
  /** HTTP status codes allowed for specific URL patterns during negative tests (e.g., 401 on /auth/login). */
  allowedHttpErrors?: Array<{
    urlPattern: RegExp;
    statuses: number[];
  }>;
  /** Console error message patterns explicitly expected during negative tests. */
  allowedConsoleErrors?: RegExp[];
  /** Ignore aborted requests caused by rapid client-side route navigation. */
  ignoreAbortedRequests?: boolean;
}

export interface BrowserErrorMonitor {
  readonly pageErrors: string[];
  readonly consoleErrors: string[];
  readonly httpErrors: DetectedHttpError[];
  readonly requestFailures: DetectedRequestFailure[];
  reset(): void;
  formatReport(): string;
  assertClean(options?: ErrorMonitorOptions): void;
}

/**
 * Attaches listeners to a Playwright page to capture:
 * - Uncaught runtime JS exceptions (`pageerror`)
 * - Browser `console.error(...)` output
 * - Failed network requests (`requestfailed`)
 * - HTTP 4xx/5xx responses across page navigations and API calls
 */
const THIRD_PARTY_NOISE_URL =
  /googleads\.g\.doubleclick\.net|googlesyndication\.com|doubleclick\.net|googletagmanager\.com/i;

export function attachBrowserErrorMonitor(page: Page): BrowserErrorMonitor {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const httpErrors: DetectedHttpError[] = [];
  const requestFailures: DetectedRequestFailure[] = [];

  page.on('pageerror', (error: Error) => {
    pageErrors.push(error.stack || error.message || String(error));
  });

  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('requestfailed', (request: Request) => {
    const failureText = request.failure()?.errorText ?? 'Unknown request failure';
    requestFailures.push({
      method: request.method(),
      url: request.url(),
      failureText,
    });
  });

  page.on('response', async (response: Response) => {
    const status = response.status();
    if (status < 400) {
      return;
    }

    if (THIRD_PARTY_NOISE_URL.test(response.url())) {
      return;
    }

    const request = response.request();
    let bodyPreview: string | undefined;
    try {
      const contentType = response.headers()['content-type'] ?? '';
      if (contentType.includes('application/json') || contentType.includes('text/')) {
        const text = await response.text();
        bodyPreview = text.slice(0, 400);
      }
    } catch {
      // Response body may already be disposed during redirects or page teardown
    }

    httpErrors.push({
      method: request.method(),
      url: response.url(),
      status,
      statusText: response.statusText(),
      bodyPreview,
    });
  });

  function formatItems(
    title: string,
    items: string[],
  ): string | null {
    if (items.length === 0) return null;
    return `${title} (${items.length}):\n${items.map((item) => `  - ${item}`).join('\n')}`;
  }

  return {
    pageErrors,
    consoleErrors,
    httpErrors,
    requestFailures,

    reset(): void {
      pageErrors.length = 0;
      consoleErrors.length = 0;
      httpErrors.length = 0;
      requestFailures.length = 0;
    },

    formatReport(): string {
      const sections = [
        formatItems('Uncaught page errors', pageErrors),
        formatItems('Console errors', consoleErrors),
        formatItems(
          'HTTP 4xx/5xx responses',
          httpErrors.map(
            (e) =>
              `${e.status} ${e.method} ${e.url}${e.bodyPreview ? ` | body: ${e.bodyPreview}` : ''}`,
          ),
        ),
        formatItems(
          'Network request failures',
          requestFailures.map((r) => `${r.method} ${r.url} (${r.failureText})`),
        ),
      ].filter((section): section is string => Boolean(section));

      return sections.length > 0 ? sections.join('\n\n') : 'No browser or HTTP errors detected.';
    },

    assertClean(options: ErrorMonitorOptions = {}): void {
      const {
        allowedHttpErrors = [],
        allowedConsoleErrors = [],
        ignoreAbortedRequests = true,
      } = options;

      // Always treat HTTP 5xx responses as unexpected failures regardless of allowances
      const unexpectedHttpErrors = httpErrors.filter((entry) => {
        if (entry.status >= 500) {
          return true;
        }
        return !allowedHttpErrors.some(
          (rule) => rule.urlPattern.test(entry.url) && rule.statuses.includes(entry.status),
        );
      });

      const unexpectedConsoleErrors = consoleErrors.filter((message) => {
        // Ignore browser's generic "Failed to load resource: the server responded with a status of 401/409"
        // when the corresponding HTTP status was explicitly allowed.
        const resourceStatusMatch = message.match(/status of (\d{3})/);
        if (resourceStatusMatch) {
          const status = Number(resourceStatusMatch[1]);
          const matchesAllowedStatus =
            status < 500 &&
            allowedHttpErrors.some((rule) => rule.statuses.includes(status));
          if (matchesAllowedStatus) {
            return false;
          }
        }
        // Ignore browser's generic "Failed to load resource: the server responded with a status of 400"
        // when it comes solely from ignored third-party ad requests (e.g. AdSense on localhost).
        if (/Failed to load resource: the server responded with a status of 400/.test(message)) {
          const hasFirstParty400 = httpErrors.some((entry) => entry.status === 400);
          if (!hasFirstParty400) {
            return false;
          }
        }
        return !allowedConsoleErrors.some((pattern) => pattern.test(message));
      });

      const unexpectedRequestFailures = requestFailures.filter((failure) => {
        if (ignoreAbortedRequests && failure.failureText.includes('ERR_ABORTED')) {
          return false;
        }
        // Ignore third-party ad/analytics blocked requests if any
        if (THIRD_PARTY_NOISE_URL.test(failure.url)) {
          return false;
        }
        return true;
      });

      const summaryParts = [
        formatItems('Uncaught page errors', pageErrors),
        formatItems('Unexpected console errors', unexpectedConsoleErrors),
        formatItems(
          'Unexpected HTTP errors (including all 5xx)',
          unexpectedHttpErrors.map(
            (e) =>
              `${e.status} ${e.method} ${e.url}${e.bodyPreview ? ` | body: ${e.bodyPreview}` : ''}`,
          ),
        ),
        formatItems(
          'Unexpected network request failures',
          unexpectedRequestFailures.map((r) => `${r.method} ${r.url} (${r.failureText})`),
        ),
      ].filter((section): section is string => Boolean(section));

      expect(
        summaryParts,
        `Detected unexpected browser/API errors:\n\n${summaryParts.join('\n\n')}`,
      ).toEqual([]);
    },
  };
}
