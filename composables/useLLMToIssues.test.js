import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseIssuesFromStream, streamIssues } from './useLLMToIssues';
import { setupFetchMock } from '@vitest/fetch';

const fetchMock = setupFetchMock();

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
  beforeEach(() => {
    fetchMock.reset();
  });

  it('should stream issues from the OpenRouter API', async () => {
    const mockResponse = new Response(`
      <IssueTitle>Issue 1</IssueTitle>
      <IssueText>This is the first issue.</IssueText>
      <IssueTitle>Issue 2</IssueTitle>
      <IssueText>This is the second issue.</IssueText>
    `, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });

    fetchMock.mockResponse(mockResponse);

    const issues = [];
    const errors = [];
    await streamIssues(
      'fake_api_key',
      'Fake prompt',
      (issue) => issues.push(issue),
      (err) => errors.push(err),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer fake_api_key',
          'Content-Type': 'application/json',
        }),
        body: expect.any(String),
      }),
    );

    expect(issues).toEqual([
      { title: 'Issue 1', body: 'This is the first issue.' },
      { title: 'Issue 2', body: 'This is the second issue.' },
    ]);
    expect(errors).toEqual([]);
  });

  it('should handle HTTP errors from the OpenRouter API', async () => {
    fetchMock.mockResponse('', { status: 500 });

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