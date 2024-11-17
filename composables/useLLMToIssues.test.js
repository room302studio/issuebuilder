import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { parseIssuesFromStream, streamIssues } from './useLLMToIssues';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Setup MSW server
const server = setupServer(
  // Mock the OpenRouter API endpoint
  http.post('https://openrouter.ai/api/v1/chat/completions', () => {
    return HttpResponse.text(`
      <IssueTitle>Issue 1</IssueTitle>
      <IssueText>This is the first issue.</IssueText>
      <IssueTitle>Issue 2</IssueTitle>
      <IssueText>This is the second issue.</IssueText>
    `)
  })
);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());

describe('parseIssuesFromStream', () => {
  it('should parse a stream of XML into Issue objects', async () => {
    const xml = `
      <IssueTitle>Issue 1</IssueTitle>
      <IssueText>This is the first issue.</IssueText>
      <IssueTitle>Issue 2</IssueTitle>
      <IssueText>This is the second issue.</IssueText>
    `;
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(xml);
        controller.close();
      },
    });

    const issues = [];
    const parser = parseIssuesFromStream(stream);
    for await (const issue of parser) {
      issues.push(issue);
    }

    expect(issues).toEqual([
      { title: 'Issue 1', body: 'This is the first issue.' },
      { title: 'Issue 2', body: 'This is the second issue.' },
    ]);
  });

  it('should handle errors in the XML stream', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue('<IssueTitle>Malformed XML');
        controller.close();
      },
    });

    await expect(async () => {
      const parser = parseIssuesFromStream(stream);
      for await (const _ of parser) {
        // do nothing
      }
    }).rejects.toThrow();
  });
});

describe('streamIssues', () => {
  it('should stream issues from the OpenRouter API', async () => {
    const issues = [];
    const errors = [];
    await streamIssues(
      'fake_api_key',
      'Fake prompt',
      (issue) => issues.push(issue),
      (err) => errors.push(err),
    );

    expect(issues).toEqual([
      { title: 'Issue 1', body: 'This is the first issue.' },
      { title: 'Issue 2', body: 'This is the second issue.' },
    ]);
    expect(errors).toEqual([]);
  });

  it('should handle HTTP errors from the OpenRouter API', async () => {
    // Override the handler for this test
    server.use(
      http.post('https://openrouter.ai/api/v1/chat/completions', () => {
        return new HttpResponse(null, { status: 500 })
      })
    );

    const issues = [];
    const errors = [];
    await streamIssues(
      'fake_api_key',
      'Fake prompt',
      (issue) => issues.push(issue),
      (err) => errors.push(err),
    );

    expect(issues).toEqual([]);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toBe('HTTP error! status: 500');
  });
});