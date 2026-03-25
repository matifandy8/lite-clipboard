/**
 * lite-clipboard core
 * Framework-agnostic clipboard utilities with minimal overhead.
 */

export type CopyInput = string | Blob | ClipboardItem | ClipboardItem[];

// Standard MIME types for common clipboard operations
const MIME_TEXT_PLAIN = 'text/plain';
const MIME_TEXT_HTML = 'text/html';

/**
 * Check if the Clipboard API is available in the current environment.
 * Handles SSR, privacy-focused browsers, and HTTP contexts.
 */
export function isSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    navigator.clipboard != null &&
    navigator.clipboard.writeText != null
  );
}

/**
 * Check if the full ClipboardItem API is supported.
 * Some browsers may have writeText but not write().
 */
export function hasAdvancedWrite(): boolean {
  if (typeof ClipboardItem === 'undefined') return false;
  if (typeof navigator?.clipboard?.write !== 'function') return false;
  return true;
}

/**
 * Result type for clipboard operations.
 * Always returns a result object instead of throwing for better DX.
 */
export interface CopyResult {
  success: boolean;
  error?: string;
}

/**
 * Copy text to the clipboard.
 * 
 * @param text - String to copy
 * @returns Result object with success status and optional error message
 * 
 * @example
 * const result = await copyText('Hello, world!');
 * if (!result.success) {
 *   console.error(result.error);
 * }
 */
export async function copyText(text: string): Promise<CopyResult> {
  if (!isSupported()) {
    return {
      success: false,
      error: 'Clipboard API is not available in this environment',
    };
  }

  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to copy to clipboard: ${message}`,
    };
  }
}

/**
 * Copy content using ClipboardItem API with full control over MIME types.
 * 
 * @param items - ClipboardItem or array of ClipboardItems
 * @returns Result object with success status
 * 
 * @example
 * const htmlBlob = new Blob(['<b>Rich text</b>'], { type: 'text/html' });
 * const textBlob = new Blob(['Rich text'], { type: 'text/plain' });
 * const item = new ClipboardItem({
 *   'text/html': htmlBlob,
 *   'text/plain': textBlob
 * });
 * const result = await copyItems(item);
 */
export async function copyItems(items: ClipboardItem | ClipboardItem[]): Promise<CopyResult> {
  if (!isSupported()) {
    return {
      success: false,
      error: 'Clipboard API is not available in this environment',
    };
  }

  if (!hasAdvancedWrite()) {
    return {
      success: false,
      error: 'Advanced clipboard write (ClipboardItem) is not supported',
    };
  }

  try {
    await navigator.clipboard.write(Array.isArray(items) ? items : [items]);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to copy to clipboard: ${message}`,
    };
  }
}

/**
 * Unified copy function that handles text, ClipboardItem, Blob, or arrays.
 * 
 * @param input - String, ClipboardItem, Blob, or ClipboardItem[]
 * @returns Result object with success status and optional error
 * 
 * @example
 * // Simple text
 * await copy('Hello!');
 * 
 * // HTML content with plain text fallback
 * const htmlBlob = new Blob(['<b>Bold</b>'], { type: 'text/html' });
 * const textBlob = new Blob(['Bold'], { type: 'text/plain' });
 * await copy(new ClipboardItem({
 *   'text/html': htmlBlob,
 *   'text/plain': textBlob
 * }));
 * 
 * // Image blob
 * await copy(imageBlob);
 * 
 * // Multiple items
 * await copy([item1, item2]);
 */
export async function copy(input: CopyInput): Promise<CopyResult> {
  // String input - use writeText for maximum compatibility
  if (typeof input === 'string') {
    return copyText(input);
  }

  // Blob input - wrap in ClipboardItem with appropriate MIME type
  if (input instanceof Blob) {
    const mimeType = input.type || MIME_TEXT_PLAIN;
    const item = new ClipboardItem({ [mimeType]: input });
    return copyItems(item);
  }

  // ClipboardItem or array - use advanced write
  return copyItems(input);
}

/**
 * Convenience function for copying HTML content.
 * Automatically includes a plain text fallback for non-HTML-aware applications.
 * 
 * @param html - HTML content to copy
 * @param plainText - Plain text fallback (defaults to stripped HTML)
 * @returns Result object with success status
 * 
 * @example
 * await copyHtml('<h1>Hello</h1><p>World</p>');
 */
export async function copyHtml(html: string, plainText?: string): Promise<CopyResult> {
  const htmlBlob = new Blob([html], { type: MIME_TEXT_HTML });
  const textBlob = new Blob([plainText ?? html.replace(/<[^>]*>/g, '')], { type: MIME_TEXT_PLAIN });

  const item = new ClipboardItem({
    [MIME_TEXT_HTML]: htmlBlob,
    [MIME_TEXT_PLAIN]: textBlob,
  });

  return copyItems(item);
}

/**
 * Convenience function for copying JSON with pretty formatting.
 * 
 * @param data - Object to copy as formatted JSON
 * @returns Result object with success status
 * 
 * @example
 * await copyJson({ name: 'John', age: 30 });
 * // Copies: "{\n  "name": "John",\n  "age": 30\n}"
 */
export async function copyJson(data: unknown): Promise<CopyResult> {
  const formatted = JSON.stringify(data, null, 2);
  return copyText(formatted);
}

// Backwards compatibility aliases
/** @deprecated Use `copy` instead - this alias exists for backwards compatibility */
export const copyToClipboard = copy;
