import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  isSupported,
  copyToClipboard,
  formatData,
  copy,
  getClipboardPermission,
  type CopyData,
} from './core.js';

const mockClipboardItem = class {
  types: string[] = [];
  async getType(_type: string): Promise<Blob> {
    return new Blob();
  }
};

function withMockNavigator(mock: Navigator | null, fn: () => void) {
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const clipboardItemDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'ClipboardItem');

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

  Object.defineProperty(globalThis, 'ClipboardItem', {
    value: mockClipboardItem,
    writable: true,
    configurable: true,
  });

  try {
    fn();
  } finally {
    if (navigatorDescriptor) {
      Object.defineProperty(globalThis, 'navigator', navigatorDescriptor);
    }
    if (clipboardItemDescriptor) {
      Object.defineProperty(globalThis, 'ClipboardItem', clipboardItemDescriptor);
    } else {
       
      // eslint-disable-next-line dot-notation
      delete globalThis['ClipboardItem'];
    }
  }
}

describe('core module', () => {
  describe('isSupported', () => {
    it('should return true when navigator.clipboard exists', () => {
      withMockNavigator({ clipboard: {} } as Navigator, () => {
        const result = isSupported();
        assert.strictEqual(result, true);
      });
    });

    it('should return false when navigator is undefined (SSR)', () => {
      withMockNavigator(null, () => {
        const result = isSupported();
        assert.strictEqual(result, false);
      });
    });

    it('should return false when navigator exists but clipboard does not', () => {
      withMockNavigator({} as Navigator, () => {
        const result = isSupported();
        assert.strictEqual(result, false);
      });
    });
  });

  describe('formatData', () => {
    it('should return string directly', () => {
      const result = formatData('hello');
      assert.strictEqual(result, 'hello');
    });

    it('should format object as pretty printed JSON', () => {
      const data: CopyData = { type: 'json', value: { name: 'test' } };
      const result = formatData(data);
      assert.strictEqual(result, '{\n  "name": "test"\n}');
    });

    it('should return code value unchanged', () => {
      const code = 'const x = 1;';
      const data: CopyData = { type: 'code', value: code, language: 'javascript' };
      const result = formatData(data);
      assert.strictEqual(result, code);
    });
  });

  describe('copyToClipboard', () => {
    it('should copy string data', async () => {
      let capturedText = '';
      withMockNavigator(
        {
          clipboard: {
            writeText: async (text: string) => {
              capturedText = text;
            },
          },
        } as unknown as Navigator,
        async () => {
          await copyToClipboard('hello');
          assert.strictEqual(capturedText, 'hello');
        },
      );
    });

    it('should format and copy JSON data', async () => {
      let capturedText = '';
      withMockNavigator(
        {
          clipboard: {
            writeText: async (text: string) => {
              capturedText = text;
            },
          },
        } as unknown as Navigator,
        async () => {
          const data: CopyData = { type: 'json', value: { name: 'test' } };
          await copyToClipboard(data);
          assert.strictEqual(capturedText, '{\n  "name": "test"\n}');
        },
      );
    });

    it('should copy HTML data', async () => {
      let capturedItems: unknown[] = [];
      withMockNavigator(
        {
          clipboard: {
            write: async (items: unknown[]) => {
              capturedItems = items;
            },
          },
        } as unknown as Navigator,
        async () => {
          const data: CopyData = { type: 'html', value: '<b>test</b>' };
          await copyToClipboard(data);
          assert.strictEqual(capturedItems.length, 1);
        },
      );
    });

    it('should throw when Clipboard API not supported', async () => {
      withMockNavigator(null, async () => {
        try {
          await copyToClipboard('hello');
          assert.fail('Should have thrown');
        } catch (err) {
          assert.ok(err instanceof Error);
          assert.strictEqual((err as Error).message, 'Clipboard API not supported');
        }
      });
    });

    it('should throw when clipboard access is denied', async () => {
      withMockNavigator(
        {
          clipboard: {
            writeText: async () => {
              throw new Error('Clipboard access denied');
            },
          },
        } as unknown as Navigator,
        async () => {
          try {
            await copyToClipboard('hello');
            assert.fail('Should have thrown');
          } catch (err) {
            assert.ok(err instanceof Error);
            assert.strictEqual((err as Error).message, 'Clipboard access denied');
          }
        },
      );
    });
  });

  describe('copy', () => {
    it('should copy string data', async () => {
      let capturedText = '';
      withMockNavigator(
        {
          clipboard: {
            writeText: async (text: string) => {
              capturedText = text;
            },
          },
        } as unknown as Navigator,
        async () => {
          await copy('hello');
          assert.strictEqual(capturedText, 'hello');
        },
      );
    });

    it('should copy JSON data', async () => {
      let capturedText = '';
      withMockNavigator(
        {
          clipboard: {
            writeText: async (text: string) => {
              capturedText = text;
            },
          },
        } as unknown as Navigator,
        async () => {
          const data: CopyData = { type: 'json', value: { name: 'test' } };
          await copy(data);
          assert.strictEqual(capturedText, '{\n  "name": "test"\n}');
        },
      );
    });
  });

  describe('getClipboardPermission', () => {
    it('should return unsupported when clipboard not supported', async () => {
      withMockNavigator(null, async () => {
        const result = await getClipboardPermission();
        assert.strictEqual(result, 'unsupported');
      });
    });

    it('should return granted when permissions query succeeds', async () => {
      const mockPermissions = {
        query: async () => ({ state: 'granted' }),
      };
      withMockNavigator(
        {
          clipboard: {},
          permissions: mockPermissions,
        } as unknown as Navigator,
        async () => {
          const result = await getClipboardPermission();
          assert.strictEqual(result, 'granted');
        },
      );
    });

    it('should return denied when permissions query returns denied', async () => {
      const mockPermissions = {
        query: async () => ({ state: 'denied' }),
      };
      withMockNavigator(
        {
          clipboard: {},
          permissions: mockPermissions,
        } as unknown as Navigator,
        async () => {
          const result = await getClipboardPermission();
          assert.strictEqual(result, 'denied');
        },
      );
    });

    it('should return granted when permissions API not available', async () => {
      withMockNavigator(
        {
          clipboard: {},
        } as unknown as Navigator,
        async () => {
          const result = await getClipboardPermission();
          assert.strictEqual(result, 'granted');
        },
      );
    });
  });
});