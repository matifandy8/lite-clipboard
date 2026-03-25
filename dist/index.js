// Main entry - React hook
export { useClipboard } from './adapters/react.js';
// Core module
export { copy, copyText, copyItems, copyHtml, copyJson, isSupported, hasAdvancedWrite, } from './core.js';
// Backwards compatibility - will be removed in next major version
export { copy as copyToClipboard } from './core.js';
