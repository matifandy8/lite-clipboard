# lite-clipboard

[![npm version](https://img.shields.io/npm/v/lite-clipboard)](https://www.npmjs.com/package/lite-clipboard)
[![npm size](https://img.shields.io/bundlephobia/minzip/lite-clipboard)](https://bundlephobia.com/result?p=lite-clipboard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A tiny (600 bytes) clipboard library for React/Vue/Svelte 
with a framework-agnostic core. No dependencies. TypeScript native.

**Target: <600 bytes gzipped**

## Philosophy

lite-clipboard is designed as a **framework-agnostic** library:

- **Core** (`core.ts`): Pure logic with zero framework imports — works anywhere
- **Adapters** (`adapters/`): Thin wrapper for each framework (React, Vue, Svelte...)
- Adding a new framework = one new file in `adapters/`

The architecture is inspired by [nanostores](https://github.com/nanostores/nanostores) — the same logic can be wrapped for Vue, Svelte, Solid, or any framework.

**Currently supported:** React 18+

**Future plans:** Vue composable, Svelte store, Solid signals.

## Features

- Zero external dependencies
- Tiny footprint (<600 bytes gzipped)
- Full TypeScript support
- Tree-shakeable
- SSR-safe
- React hook included
- Framework-agnostic core (add your own wrapper!)

## Why lite-clipboard?

### Native JS ❌

```javascript
// ❌ Verbose, manual error handling
const copyToClipboard = async (text) => {
  if (!navigator.clipboard) {
    throw new Error('Clipboard not supported');
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    throw new Error('Copy failed: ' + err.message);
  }
};
```

### lite-clipboard ✅

```javascript
import { copyToClipboard } from 'lite-clipboard';

// ✅ 1 line, handles everything
await copyToClipboard('Hello!');
```

### Native React ❌

```tsx
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return <button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</button>;
}
```

### lite-clipboard ✅

```tsx
import { useClipboard } from 'lite-clipboard';

function CopyButton({ text }) {
  const { copied, copy } = useClipboard();

  return <button onClick={() => copy(text)}>{copied ? 'Copied!' : 'Copy'}</button>;
}
```

### Why choose lite-clipboard?

| Aspect | Native JS | lite-clipboard |
|--------|-----------|----------------|
| Lines of code | 15+ | 1 |
| Error handling | Manual | Built-in |
| React state | Manual | Built-in |
| Timeout reset | Manual | Automatic |
| Callbacks | Manual | Built-in |
| TypeScript | Manual | Built-in |
| SSR safety | Manual | Built-in |

## Install

npm install lite-clipboard

> lite-clipboard is fully tree-shakeable. Import only what you need
> and your bundler will eliminate the rest.

## Framework support

| Framework | Import | Status |
|---|---|---|
| Vanilla JS | `import { copyToClipboard } from 'lite-clipboard'` | ✅ stable |
| React | `import { useClipboard } from 'lite-clipboard/react'` | ✅ stable |
| Vue | `import { useClipboard } from 'lite-clipboard/vue'` | 🔜 coming soon |
| Svelte | `import { useClipboard } from 'lite-clipboard/svelte'` | 🔜 coming soon |

## Usage

### Default (React)

import { useClipboard } from 'lite-clipboard'

### Framework-specific (tree-shakeable)

import { useClipboard } from 'lite-clipboard/react'

### Vanilla JS / Framework agnostic

import { copyToClipboard, formatData, isSupported } from 'lite-clipboard'

### Core (Framework-Agnostic)

The core module works anywhere — browser, Node.js (with clipboard polyfill), or any framework.

```typescript
import { isSupported, copyToClipboard, formatData } from 'lite-clipboard';

// Check if clipboard API is available
if (isSupported()) {
  // Copy string
  await copyToClipboard('Hello!');

  // Copy JSON (auto-formatted as pretty JSON)
  await copyToClipboard({ type: 'json', value: { name: 'test' } });

  // Copy code
  await copyToClipboard({ type: 'code', value: 'const x = 1', language: 'js' });
}

// Format without copying
const text = formatData({ type: 'json', value: { foo: 'bar' } });
// → "{\n  \"foo\": \"bar\"\n}"
```

### React Hook

```tsx
import { useClipboard } from 'lite-clipboard';

function CopyButton({ text }) {
  const { copied, copy } = useClipboard();

  return (
    <button onClick={() => copy(text)}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
```

#### With Callbacks

```tsx
import { useClipboard } from 'lite-clipboard';

function CopyButton({ text }) {
  const { copy } = useClipboard({
    onSuccess: () => console.log('Copied!'),
    onError: (err) => console.error('Failed:', err),
  });

  return <button onClick={() => copy(text)}>Copy</button>;
}
```

#### With Auto-Reset

```tsx
import { useClipboard } from 'lite-clipboard';

function CopyButton({ text }) {
  // Auto-reset copied state after 2 seconds (default)
  const { copied, copy } = useClipboard({ timeout: 2000 });

  return <button onClick={() => copy(text)}>{copied ? 'Copied!' : 'Copy'}</button>;
}
```

## Advanced Usage

### Copy HTML

Copies rich text with HTML formatting:

```tsx
copyToClipboard({
  type: 'html',
  value: '<h1>Hello World</h1><p>Formatted text</p>'
})
```

### Check Permissions (Advanced)

Most of the time, clipboard works without explicit permission. However, `getClipboardPermission()` is useful for detecting edge cases:

```typescript
import { getClipboardPermission } from 'lite-clipboard'

const state = await getClipboardPermission()
// 'granted' | 'denied' | 'prompt' | 'unsupported'
```

**When it matters:**
- Automated testing (Playwright, Puppeteer)
- Users with privacy extensions
- Embedded iframes without proper permissions
- HTTP context (requires HTTPS in production)

**For most users, clipboard works automatically.**

```typescript
// Most of the time, just use it directly:
const { copy } = useClipboard()
copy('Hello!')
```

### Copy Image

Copy images as Blob:

```tsx
copyToClipboard({
  type: 'image',
  value: imageBlob
})
```

## API

### CopyData Type

```typescript
type CopyData =
  | string
  | { type: 'json'; value: unknown }
  | { type: 'code'; value: string; language: string }
  | { type: 'html'; value: string }
  | { type: 'image'; value: Blob }
```

### Core Functions

| Function | Type | Description |
|----------|------|-------------|
| `isSupported()` | `() => boolean` | Check if Clipboard API is available (SSR-safe) |
| `copyToClipboard(data)` | `(data: CopyData) => Promise<void>` | Copy to clipboard |
| `formatData(data)` | `(data: CopyData) => string` | Format data without copying |
| `getClipboardPermission()` | `() => Promise<PermissionState>` | Advanced: Check clipboard permission status (mainly for testing/CI) |
| `copy` | alias for `copyToClipboard` | Shorthand |

### PermissionState Type

```typescript
type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported'
```

### React Hook

```typescript
interface UseClipboardOptions {
  timeout?: number;        // Auto-reset delay in ms (default: 2000)
  onSuccess?: () => void; // Called on successful copy
  onError?: (error: string) => void; // Called on error
}

interface UseClipboardReturn {
  copied: boolean;         // Current copied state
  error: string | null;   // Current error message
  supported: boolean;      // Clipboard API availability
  copy: (data: CopyData) => Promise<void>;
}
```

## Bundle Size

| Module | Gzipped |
|--------|---------|
| Core utilities | ~166 bytes |
| React hook | ~342 bytes |
| **Hook target** | **<600 bytes** ✅ |

## Browser Support

Requires `navigator.clipboard` API:

- Chrome 
- Firefox 
- Safari
- Edge

## Contributing

The core is intentionally minimal. Want to add Vue or Svelte support? The core API is designed to be wrapped easily:

```typescript
// Example: Your own Vue composable
import { copyToClipboard, isSupported } from 'lite-clipboard';

export function useClipboard() {
  return {
    copy: copyToClipboard,
    supported: isSupported(),
  };
}
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

MIT