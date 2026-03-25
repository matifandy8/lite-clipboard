# lite-clipboard

**~400 bytes. No dependencies. Works.**

```bash
npm install lite-clipboard
```

## Usage

```tsx
import { useClipboard } from 'lite-clipboard';

function CopyButton({ text }) {
  const { copied, copy } = useClipboard();
  return <button onClick={() => copy(text)}>{copied ? 'Copied!' : 'Copy'}</button>;
}
```

## Vanilla JS

```js
import { copy } from 'lite-clipboard';

// String, Blob, ClipboardItem — all work
await copy('Hello!');
await copy(imageBlob);
await copy(new ClipboardItem({ 'text/html': htmlBlob }));

// Convenience helpers
await copyHtml('<b>Bold</b>');
await copyJson({ name: 'Alice' });
```

## API

```ts
// React hook
const { copied, copy, error, supported } = useClipboard({ timeout: 2000 });
await copy('text');

// Core
copy(text: string | Blob | ClipboardItem): Promise<CopyResult>
copyText(text: string): Promise<CopyResult>
copyHtml(html: string, plainText?: string): Promise<CopyResult>
copyJson(data: unknown): Promise<CopyResult>
isSupported(): boolean
```

## CopyResult

```ts
{ success: true } | { success: false, error: string }
```

## Size

| Module | Gzipped |
|--------|---------|
| Core | 327B |
| React hook | 518B |

## Browser Support

Requires `navigator.clipboard`. All modern browsers.
