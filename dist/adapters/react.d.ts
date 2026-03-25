/**
 * React hook for clipboard operations.
 * Provides reactive state and callbacks for clipboard interactions.
 */
import type { CopyInput } from '../core.js';
export interface UseClipboardOptions {
    /** Time in ms before resetting `copied` state back to false */
    timeout?: number;
    /** Called when copy succeeds */
    onSuccess?: () => void;
    /** Called when copy fails - receives error message string */
    onError?: (error: string) => void;
}
export interface UseClipboardReturn {
    /** Whether the last copy operation succeeded */
    copied: boolean;
    /** Error message if last copy failed, null otherwise */
    error: string | null;
    /** Whether Clipboard API is available in this environment */
    supported: boolean;
    /** Copy function - accepts string, Blob, ClipboardItem, or array */
    copy: (input: CopyInput) => Promise<void>;
}
export declare function useClipboard(options?: UseClipboardOptions): UseClipboardReturn;
