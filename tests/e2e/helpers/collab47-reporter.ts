import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

interface RecordedTestEntry {
  specFile: string;
  title: string;
  status: TestResult['status'];
  durationMs: number;
  errorMessage?: string;
  videoPath?: string;
  screenshotPath?: string;
}

/**
 * Custom Playwright Reporter for Collab47 E2E suites.
 * Prints a structured pass/fail table with detected errors and attached video/screenshot paths
 * alongside Playwright's built-in HTML, JSON, and JUnit reporters.
 */
export default class Collab47Reporter implements Reporter {
  private readonly entries: RecordedTestEntry[] = [];
  private startedAt = 0;

  onBegin(_config: FullConfig, suite: Suite): void {
    this.startedAt = Date.now();
    const totalTests = suite.allTests().length;
    console.log('\n======================================================================');
    console.log(`  Collab47 Playwright E2E Reporter — Running ${totalTests} test(s)`);
    console.log('======================================================================\n');
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const videoAttachment = result.attachments.find((att) => att.name === 'video');
    const screenshotAttachment = result.attachments.find((att) => att.name === 'screenshot');
    const rawError = result.errors[0]?.message ?? result.error?.message;
    const cleanError = rawError
      ? rawError
          .replace(/\u001b\[[0-9;]*m/g, '')
          .split('\n')
          .slice(0, 4)
          .join(' | ')
      : undefined;

    const normalizedFile = test.location.file.replace(/\\/g, '/');
    const specFile = normalizedFile.split('/tests/e2e/')[1] ?? normalizedFile;

    this.entries.push({
      specFile,
      title: test.title,
      status: result.status,
      durationMs: result.duration,
      errorMessage: cleanError,
      videoPath: videoAttachment?.path,
      screenshotPath: screenshotAttachment?.path,
    });
  }

  onEnd(result: FullResult): void {
    const totalDurationSec = ((Date.now() - this.startedAt) / 1000).toFixed(1);
    const passed = this.entries.filter((e) => e.status === 'passed').length;
    const failed = this.entries.filter(
      (e) => e.status === 'failed' || e.status === 'timedOut' || e.status === 'interrupted',
    ).length;
    const skipped = this.entries.filter((e) => e.status === 'skipped').length;

    console.log('\n======================================================================');
    console.log('  Collab47 Playwright Test Summary Report');
    console.log('======================================================================');
    console.log(
      `  Overall: ${result.status.toUpperCase()} | Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped} | Duration: ${totalDurationSec}s`,
    );
    console.log('----------------------------------------------------------------------');

    for (const [idx, entry] of this.entries.entries()) {
      const badge =
        entry.status === 'passed'
          ? '[PASS]'
          : entry.status === 'skipped'
            ? '[SKIP]'
            : '[FAIL]';
      const sec = (entry.durationMs / 1000).toFixed(1);
      console.log(`  ${idx + 1}. ${badge} (${sec}s) [${entry.specFile}] ${entry.title}`);
      if (entry.videoPath) {
        console.log(`       Video: ${entry.videoPath}`);
      }
      if (entry.errorMessage) {
        console.log(`       Error: ${entry.errorMessage}`);
      }
    }

    console.log('----------------------------------------------------------------------');
    console.log('  HTML Report  : frontend/playwright-report/index.html');
    console.log('  JSON Report  : frontend/test-results/results.json');
    console.log('  JUnit Report : frontend/test-results/junit.xml');
    console.log('  Open HTML UI : npm --prefix frontend run test:e2e:report');
    console.log('======================================================================\n');
  }
}
