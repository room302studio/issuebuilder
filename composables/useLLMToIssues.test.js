import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { useLLMToIssues } from './useLLMToIssues';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { setActivePinia, createPinia } from 'pinia';

// Setup MSW server
const server = setupServer(
  // Mock the OpenRouter API endpoint
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
  // Create a fresh Pinia instance and set it as active
  setActivePinia(createPinia());
});

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());

describe('useLLMToIssues', () => {
  it('should stream issues from the OpenRouter API', async () => {
    const { streamIssues, isProcessing } = useLLMToIssues();

    await streamIssues(
      'fake_api_key',
      [{ role: 'user', content: 'Generate some issues' }],
      true
    );

    // Wait for processing to complete
    await vi.waitFor(() => expect(isProcessing.value).toBe(false));

    // Get the store and check its state
    const store = useAppStore();
    expect(store.itemList.value).toEqual([
      { title: 'Issue 1', body: 'This is the first issue.' },
      { title: 'Issue 2', body: 'This is the second issue.' }
    ]);
  });

  it('should handle HTTP errors from the OpenRouter API', async () => {
    // Override the handler for this test
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

    // Wait for processing to complete
    await vi.waitFor(() => expect(isProcessing.value).toBe(false));

    expect(error.value).toBeTruthy();
    expect(error.value?.message).toContain('500');

    // Check that no issues were added
    const store = useAppStore();
    expect(store.itemList.value).toEqual([]);
  });
});