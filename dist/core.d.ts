/**
 * lite-clipboard core
 * Framework-agnostic clipboard utilities with minimal overhead.
 */
export type CopyInput = string | Blob | ClipboardItem | ClipboardItem[];
/**
 * Check if the Clipboard API is available in the current environment.
 * Handles SSR, privacy-focused browsers, and HTTP contexts.
 */
export declare function isSupported(): boolean;
/**
 * Check if the full ClipboardItem API is supported.
 * Some browsers may have writeText but not write().
 */
export declare function hasAdvancedWrite(): boolean;
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
export declare function copyText(text: string): Promise<CopyResult>;
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
export declare function copyItems(items: ClipboardItem | ClipboardItem[]): Promise<CopyResult>;
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
export declare function copy(input: CopyInput): Promise<CopyResult>;
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
export declare function copyHtml(html: string, plainText?: string): Promise<CopyResult>;
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
export declare function copyJson(data: unknown): Promise<CopyResult>;
/** @deprecated Use `copy` instead - this alias exists for backwards compatibility */
export declare const copyToClipboard: typeof copy;
