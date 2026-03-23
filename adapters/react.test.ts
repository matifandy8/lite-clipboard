import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatData, copyToClipboard, type CopyData } from '../core.js';

function withMockNavigator(mock: Navigator | null, fn: () => void) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

  if (mock === null) {
    Object.defineProperty(globalThis, 'navigator', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  } else {
    Object.defineProperty(globalThis, 'navigator', {
      value: mock,
      writable: true,
      configurable: true,
    });
  }

  try {
    fn();
  } finally {
    if (descriptor) {
      Object.defineProperty(globalThis, 'navigator', descriptor);
    }
  }
}

describe('react hook', () => {
  describe('formatData integration', () => {
    it('should format string data', () => {
      const result = formatData('hello');
      assert.strictEqual(result, 'hello');
    });

    it('should format JSON data', () => {
      const data: CopyData = { type: 'json', value: { name: 'test' } };
      const result = formatData(data);
      assert.strictEqual(result, '{\n  "name": "test"\n}');
    });

    it('should format code data', () => {
      const code = 'const x = 1;';
      const data: CopyData = { type: 'code', value: code, language: 'javascript' };
      const result = formatData(data);
      assert.strictEqual(result, code);
    });
  });

  describe('copyToClipboard integration', () => {
    it('should copy string data', async () => {
      let capturedText = '';
      withMockNavigator({
        clipboard: {
          writeText: async (text: string) => {
            capturedText = text;
          },
        },
      } as unknown as Navigator, async () => {
        await copyToClipboard('hello');
        assert.strictEqual(capturedText, 'hello');
      });
    });

    it('should copy JSON data', async () => {
      let capturedText = '';
      withMockNavigator({
        clipboard: {
          writeText: async (text: string) => {
            capturedText = text;
          },
        },
      } as unknown as Navigator, async () => {
        const data: CopyData = { type: 'json', value: { name: 'test' } };
        await copyToClipboard(data);
        assert.strictEqual(capturedText, '{\n  "name": "test"\n}');
      });
    });

    it('should copy code data', async () => {
      let capturedText = '';
      withMockNavigator({
        clipboard: {
          writeText: async (text: string) => {
            capturedText = text;
          },
        },
      } as unknown as Navigator, async () => {
        const data: CopyData = { type: 'code', value: 'const x = 1;', language: 'javascript' };
        await copyToClipboard(data);
        assert.strictEqual(capturedText, 'const x = 1;');
      });
    });

    it('should throw when clipboard API not supported', async () => {
      withMockNavigator(null, async () => {
        try {
          await copyToClipboard('test');
          assert.fail('Should have thrown');
        } catch (err) {
          assert.ok(err instanceof Error);
          assert.strictEqual((err as Error).message, 'Clipboard API not supported');
        }
      });
    });

    it('should throw when clipboard access denied', async () => {
      withMockNavigator({
        clipboard: {
          writeText: async () => {
            throw new Error('Clipboard access denied');
          },
        },
      } as unknown as Navigator, async () => {
        try {
          await copyToClipboard('test');
          assert.fail('Should have thrown');
        } catch (err) {
          assert.ok(err instanceof Error);
          assert.strictEqual((err as Error).message, 'Clipboard access denied');
        }
      });
    });
  });
});
