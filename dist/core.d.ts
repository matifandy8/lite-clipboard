export type CopyData = {
    language: string;
    type: 'code';
    value: string;
} | {
    type: 'html';
    value: string;
} | {
    type: 'image';
    value: Blob;
} | {
    type: 'json';
    value: unknown;
} | string;
export type PermissionState = 'denied' | 'granted' | 'prompt' | 'unsupported';
export declare function isSupported(): boolean;
export declare function formatData(data: CopyData): string;
export declare function copyToClipboard(data: CopyData): Promise<void>;
export declare function getClipboardPermission(): Promise<PermissionState>;
export declare const copy: typeof copyToClipboard;
