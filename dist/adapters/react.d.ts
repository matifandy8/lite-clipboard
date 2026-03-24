import type { CopyData } from '../core.js';
export interface UseClipboardOptions {
    onError?: (error: string) => void;
    onSuccess?: () => void;
    timeout?: number;
}
export interface UseClipboardReturn {
    copied: boolean;
    copy: (data: CopyData) => Promise<void>;
    error: null | string;
    supported: boolean;
}
export declare function useClipboard(options?: UseClipboardOptions): UseClipboardReturn;
