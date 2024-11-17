import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { useLLMToIssues } from './useLLMToIssues';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Setup MSW server
const server = setupServer(
  http.post('https://openrouter.ai/api/v1/chat/completions', () => {
    return new Response(
      `data: {"choices":[{"delta":{"content":"<IssueTitle>Issue 1</IssueTitle>"}}]}\n\n` +
      `data: {"choices":[{"delta":{"content":"<IssueText>This is the first issue.</IssueText>"}}]}\n\n` +
      `data: {"choices":[{"delta":{"content":"<IssueTitle>Issue 2</IssueTitle>"}}]}\n\n` +
      `data: {"choices":[{"delta":{"content":"<IssueText>This is the second issue.</IssueText>"}}]}\n\n` +
      `data: [DONE]`,
      { headers: { 'Content-Type': 'text/event-stream' } }
    );
  })
);

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());

describe('useLLMToIssues', () => {
  it('should stream issues from the OpenRouter API', async () => {
    const { streamIssues, isProcessing } = useLLMToIssues();
    const issues: any[] = [];

    // Mock the store's addItem function
    vi.mock('~/stores/app', () => ({
      useAppStore: () => ({
        addItem: (issue: any) => issues.push(issue)
      })
    }));

    await streamIssues(
      'fake_api_key',
      [{ role: 'user', content: 'Generate some issues' }],
      true
    );

    expect(issues).toEqual([
      { title: 'Issue 1', body: 'This is the first issue.' },
      { title: 'Issue 2', body: 'This is the second issue.' }
    ]);
    expect(isProcessing.value).toBe(false);
  });

  it('should handle HTTP errors from the OpenRouter API', async () => {
    server.use(
      http.post('https://openrouter.ai/api/v1/chat/completions', () => {
        return new HttpResponse(null, { status: 500 })
      })
    );

    const { streamIssues, error, isProcessing } = useLLMToIssues();

    await streamIssues(
      'fake_api_key',
      [{ role: 'user', content: 'Generate some issues' }],
      true
    );

    expect(error.value).toBeTruthy();
    expect(error.value?.message).toContain('500');
    expect(isProcessing.value).toBe(false);
  });
});