/**
 * Tests for lite-clipboard core module
 * Uses Node.js test runner with mocked clipboard APIs
 */

import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import {
  isSupported,
  hasAdvancedWrite,
  copy,
  copyText,
  copyItems,
  copyHtml,
  copyJson,
  type CopyInput,
  type CopyResult,
} from './core.js';

// Mock ClipboardItem class for environments that don't have it
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

// Helper to set up clipboard mocks
interface ClipboardMock {
  writeText?: (text: string) => Promise<void>;
  write?: (items: ClipboardItem[]) => Promise<void>;
}

function setupClipboardMock(mock: ClipboardMock) {
  const originalNavigator = globalThis.navigator;
  const originalClipboardItem = (globalThis as typeof globalThis & { ClipboardItem?: typeof ClipboardItem }).ClipboardItem;

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
    if (originalClipboardItem !== undefined) {
      Object.defineProperty(globalThis, 'ClipboardItem', {
        value: originalClipboardItem,
        writable: true,
        configurable: true,
      });
    } else {
      Object.defineProperty(globalThis, 'ClipboardItem', {
        value: undefined,
        writable: true,
        configurable: true,
      });
    }
  };
}

describe('isSupported', () => {
  it('returns true when navigator.clipboard.writeText exists', () => {
    const cleanup = setupClipboardMock({ writeText: async () => {} });
    try {
      assert.strictEqual(isSupported(), true);
    } finally {
      cleanup();
    }
  });

  it('returns false when navigator is undefined (SSR)', () => {
    const originalNavigator = globalThis.navigator;
    Object.defineProperty(globalThis, 'navigator', { value: undefined, writable: true, configurable: true });
    try {
      assert.strictEqual(isSupported(), false);
    } finally {
      Object.defineProperty(globalThis, 'navigator', { value: originalNavigator, writable: true, configurable: true });
    }
  });

  it('returns false when clipboard API is missing', () => {
    const cleanup = setupClipboardMock({});
    try {
      assert.strictEqual(isSupported(), false);
    } finally {
      cleanup();
    }
  });
});

describe('hasAdvancedWrite', () => {
  it('returns true when ClipboardItem and clipboard.write exist', () => {
    const cleanup = setupClipboardMock({
      writeText: async () => {},
      write: async () => {},
    });
    try {
      assert.strictEqual(hasAdvancedWrite(), true);
    } finally {
      cleanup();
    }
  });

  it('returns false when ClipboardItem is undefined', () => {
    const cleanup = setupClipboardMock({ writeText: async () => {} });
    try {
      assert.strictEqual(hasAdvancedWrite(), false);
    } finally {
      cleanup();
    }
  });

  it('returns false when clipboard.write is undefined', () => {
    const cleanup = setupClipboardMock({ writeText: async () => {} });
    try {
      assert.strictEqual(hasAdvancedWrite(), false);
    } finally {
      cleanup();
    }
  });
});

describe('copyText', () => {
  it('copies string text successfully', async () => {
    let captured = '';
    const cleanup = setupClipboardMock({
      writeText: async (text) => { captured = text; },
    });

    try {
      const result = await copyText('Hello, world!');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.error, undefined);
      assert.strictEqual(captured, 'Hello, world!');
    } finally {
      cleanup();
    }
  });

  it('returns error result when clipboard access fails', async () => {
    const cleanup = setupClipboardMock({
      writeText: async () => {
        throw new Error('Clipboard access denied');
      },
    });

    try {
      const result = await copyText('test');
      assert.strictEqual(result.success, false);
      assert.ok(result.error?.includes('Clipboard access denied'));
    } finally {
      cleanup();
    }
  });

  it('returns error result when not supported', () => {
    const originalNavigator = globalThis.navigator;
    Object.defineProperty(globalThis, 'navigator', { value: undefined, writable: true, configurable: true });
    try {
      const result = copyText('test');
      // Note: this returns a resolved promise, so we need to await it
      return result.then((r) => {
        assert.strictEqual(r.success, false);
        assert.ok(r.error?.includes('not available'));
      });
    } finally {
      Object.defineProperty(globalThis, 'navigator', { value: originalNavigator, writable: true, configurable: true });
    }
  });
});

describe('copyItems', () => {
  it('copies single ClipboardItem successfully', async () => {
    let capturedItems: ClipboardItem[] = [];
    const cleanup = setupClipboardMock({
      writeText: async () => {},
      write: async (items) => { capturedItems = items; },
    });

    try {
      const blob = new Blob(['<b>test</b>'], { type: 'text/html' });
      const item = new ClipboardItem({ 'text/html': blob });
      const result = await copyItems(item);

      assert.strictEqual(result.success, true);
      assert.strictEqual(capturedItems.length, 1);
    } finally {
      cleanup();
    }
  });

  it('copies array of ClipboardItems', async () => {
    let capturedItems: ClipboardItem[] = [];
    const cleanup = setupClipboardMock({
      writeText: async () => {},
      write: async (items) => { capturedItems = items; },
    });

    try {
      const blob1 = new Blob(['item1'], { type: 'text/plain' });
      const blob2 = new Blob(['item2'], { type: 'text/plain' });
      const items = [
        new ClipboardItem({ 'text/plain': blob1 }),
        new ClipboardItem({ 'text/plain': blob2 }),
      ];
      const result = await copyItems(items);

      assert.strictEqual(result.success, true);
      assert.strictEqual(capturedItems.length, 2);
    } finally {
      cleanup();
    }
  });

  it('returns error when advanced write is not supported', async () => {
    // Set up mock with ClipboardItem available but no write method
    const originalClipboardItem = (globalThis as typeof globalThis & { ClipboardItem?: typeof ClipboardItem }).ClipboardItem;
    Object.defineProperty(globalThis, 'ClipboardItem', {
      value: MockClipboardItem,
      writable: true,
      configurable: true,
    });

    const cleanup = setupClipboardMock({ writeText: async () => {} });

    try {
      const blob = new Blob(['test'], { type: 'text/plain' });
      const item = new globalThis.ClipboardItem({ 'text/plain': blob });
      const result = await copyItems(item);

      assert.strictEqual(result.success, false);
      assert.ok(result.error?.includes('not supported'));
    } finally {
      cleanup();
      if (originalClipboardItem !== undefined) {
        Object.defineProperty(globalThis, 'ClipboardItem', {
          value: originalClipboardItem,
          writable: true,
          configurable: true,
        });
      }
    }
  });
});

describe('copy (unified API)', () => {
  it('handles string input via copyText', async () => {
    let captured = '';
    const cleanup = setupClipboardMock({
      writeText: async (text) => { captured = text; },
    });

    try {
      const result = await copy('Hello!');
      assert.strictEqual(result.success, true);
      assert.strictEqual(captured, 'Hello!');
    } finally {
      cleanup();
    }
  });

  it('handles Blob input by wrapping in ClipboardItem', async () => {
    let capturedItems: ClipboardItem[] = [];
    const cleanup = setupClipboardMock({
      writeText: async () => {},
      write: async (items) => { capturedItems = items; },
    });

    try {
      const blob = new Blob(['image data'], { type: 'image/png' });
      const result = await copy(blob);

      assert.strictEqual(result.success, true);
      assert.strictEqual(capturedItems.length, 1);
    } finally {
      cleanup();
    }
  });

  it('handles ClipboardItem input', async () => {
    let capturedItems: ClipboardItem[] = [];
    const cleanup = setupClipboardMock({
      writeText: async () => {},
      write: async (items) => { capturedItems = items; },
    });

    try {
      const blob = new Blob(['test'], { type: 'text/plain' });
      const item = new ClipboardItem({ 'text/plain': blob });
      const result = await copy(item);

      assert.strictEqual(result.success, true);
      assert.strictEqual(capturedItems.length, 1);
    } finally {
      cleanup();
    }
  });

  it('returns error for unsupported environment', async () => {
    const originalNavigator = globalThis.navigator;
    Object.defineProperty(globalThis, 'navigator', { value: undefined, writable: true, configurable: true });
    try {
      const result = await copy('test');
      assert.strictEqual(result.success, false);
      assert.ok(result.error?.includes('not available'));
    } finally {
      Object.defineProperty(globalThis, 'navigator', { value: originalNavigator, writable: true, configurable: true });
    }
  });
});

describe('copyHtml', () => {
  it('copies HTML with plain text fallback', async () => {
    let capturedItems: ClipboardItem[] = [];
    const cleanup = setupClipboardMock({
      writeText: async () => {},
      write: async (items) => { capturedItems = items; },
    });

    try {
      const result = await copyHtml('<b>Bold</b>');
      assert.strictEqual(result.success, true);

      // Verify the items contain both HTML and plain text
      const item = capturedItems[0];
      assert.ok(item.types.includes('text/html'));
      assert.ok(item.types.includes('text/plain'));
    } finally {
      cleanup();
    }
  });

  it('uses provided plain text when given', async () => {
    let capturedItems: ClipboardItem[] = [];
    let plainText = '';
    const cleanup = setupClipboardMock({
      writeText: async () => {},
      write: async (items) => { capturedItems = items; },
    });

    try {
      await copyHtml('<b>Bold</b>', 'Custom plain text');

      const item = capturedItems[0];
      const textBlob = await item.getType('text/plain');
      plainText = await textBlob.text();
      assert.strictEqual(plainText, 'Custom plain text');
    } finally {
      cleanup();
    }
  });
});

describe('copyJson', () => {
  it('copies pretty-printed JSON', async () => {
    let captured = '';
    const cleanup = setupClipboardMock({
      writeText: async (text) => { captured = text; },
    });

    try {
      const result = await copyJson({ name: 'test', value: 42 });
      assert.strictEqual(result.success, true);
      assert.ok(captured.includes('"name": "test"'));
      assert.ok(captured.includes('"value": 42'));
    } finally {
      cleanup();
    }
  });

  it('handles nested objects', async () => {
    let captured = '';
    const cleanup = setupClipboardMock({
      writeText: async (text) => { captured = text; },
    });

    try {
      await copyJson({ nested: { deep: { value: true } } });
      assert.ok(captured.includes('"nested"'));
      assert.ok(captured.includes('"deep"'));
    } finally {
      cleanup();
    }
  });
});

describe('error handling', () => {
  it('captures error message from Error objects', async () => {
    const cleanup = setupClipboardMock({
      writeText: async () => {
        throw new Error('Specific error message');
      },
    });

    try {
      const result = await copy('test');
      assert.strictEqual(result.success, false);
      assert.ok(result.error?.includes('Specific error message'));
    } finally {
      cleanup();
    }
  });

  it('handles non-Error throws gracefully', async () => {
    const cleanup = setupClipboardMock({
      writeText: async () => {
        throw 'string error';
      },
    });

    try {
      const result = await copy('test');
      assert.strictEqual(result.success, false);
      assert.ok(result.error?.includes('Unknown error'));
    } finally {
      cleanup();
    }
  });
});
