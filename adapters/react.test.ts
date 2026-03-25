/**
 * Tests for React useClipboard hook
 * Tests the integration with the core module
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

// Mock ClipboardItem for testing
const MockClipboardItem = class {
  types: string[];
  data: Map<string, Blob>;

  constructor(data: Record<string, Blob>) {
    this.types = Object.keys(data);
    this.data = new Map(Object.entries(data));
  }

  async getType(type: string): Promise<Blob> {
    const blob = this.data.get(type);
    if (!blob) throw new Error(`Type ${type} not found`);
    return blob;
  }
};

// Mock React's useState, useEffect, useCallback, useRef
// In a real scenario, you'd use @testing-library/react or similar
// For this test, we verify the hook's contract and behavior

function setupClipboardMock(mock: { writeText?: (text: string) => Promise<void>; write?: (items: ClipboardItem[]) => Promise<void> }) {
  const originalNavigator = globalThis.navigator;

  Object.defineProperty(globalThis, 'navigator', {
    value: {
      clipboard: mock,
    },
    writable: true,
    configurable: true,
  });

  if (mock.write) {
    Object.defineProperty(globalThis, 'ClipboardItem', {
      value: MockClipboardItem,
      writable: true,
      configurable: true,
    });
  }

  return () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'ClipboardItem', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  };
}

// We can't fully test the React hook without a React runtime,
// but we can test the core functions it depends on and verify the API contract

describe('useClipboard hook contract', () => {
  describe('core dependencies', () => {
    it('copy handles string input', async () => {
      let captured = '';
      const cleanup = setupClipboardMock({
        writeText: async (text) => { captured = text; },
      });

      try {
        // Import dynamically to test the actual module
        const { copy } = await import('../core.js');
        const result = await copy('test string');
        assert.strictEqual(result.success, true);
        assert.strictEqual(captured, 'test string');
      } finally {
        cleanup();
      }
    });

    it('copy handles ClipboardItem input', async () => {
      let captured: ClipboardItem[] = [];
      const cleanup = setupClipboardMock({
        writeText: async () => {},
        write: async (items) => { captured = items; },
      });

      try {
        const { copy } = await import('../core.js');
        const blob = new Blob(['<b>test</b>'], { type: 'text/html' });
        const item = new ClipboardItem({ 'text/html': blob });
        const result = await copy(item);

        assert.strictEqual(result.success, true);
        assert.strictEqual(captured.length, 1);
      } finally {
        cleanup();
      }
    });

    it('copy returns error result for unsupported environment', async () => {
      const originalNavigator = globalThis.navigator;
      Object.defineProperty(globalThis, 'navigator', { value: undefined, writable: true, configurable: true });

      try {
        const { copy } = await import('../core.js');
        const result = await copy('test');
        assert.strictEqual(result.success, false);
        assert.ok(result.error !== undefined);
      } finally {
        Object.defineProperty(globalThis, 'navigator', { value: originalNavigator, writable: true, configurable: true });
      }
    });
  });

  describe('copyText behavior', () => {
    it('returns success for valid text', async () => {
      const cleanup = setupClipboardMock({
        writeText: async () => {},
      });

      try {
        const { copyText } = await import('../core.js');
        const result = await copyText('hello');
        assert.strictEqual(result.success, true);
      } finally {
        cleanup();
      }
    });

    it('returns error result when clipboard fails', async () => {
      const cleanup = setupClipboardMock({
        writeText: async () => {
          throw new Error('Permission denied');
        },
      });

      try {
        const { copyText } = await import('../core.js');
        const result = await copyText('hello');
        assert.strictEqual(result.success, false);
        assert.ok(result.error?.includes('Permission denied'));
      } finally {
        cleanup();
      }
    });
  });

  describe('copyHtml behavior', () => {
    it('copies HTML with plain text fallback', async () => {
      let captured: ClipboardItem[] = [];
      const cleanup = setupClipboardMock({
        writeText: async () => {},
        write: async (items) => { captured = items; },
      });

      try {
        const { copyHtml } = await import('../core.js');
        const result = await copyHtml('<h1>Title</h1><p>Paragraph</p>');

        assert.strictEqual(result.success, true);
        const item = captured[0];
        assert.ok(item.types.includes('text/html'));
        assert.ok(item.types.includes('text/plain'));

        const htmlBlob = await item.getType('text/html');
        const htmlText = await htmlBlob.text();
        assert.ok(htmlText.includes('<h1>Title</h1>'));
      } finally {
        cleanup();
      }
    });
  });

  describe('copyJson behavior', () => {
    it('formats JSON with indentation', async () => {
      let captured = '';
      const cleanup = setupClipboardMock({
        writeText: async (text) => { captured = text; },
      });

      try {
        const { copyJson } = await import('../core.js');
        const result = await copyJson({ name: 'Alice', age: 30 });

        assert.strictEqual(result.success, true);
        assert.ok(captured.includes('\n'));
        assert.ok(captured.includes('  "name"'));
      } finally {
        cleanup();
      }
    });
  });
});
