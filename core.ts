export type CopyData =
  | { language: string; type: 'code'; value: string }
  | { type: 'html'; value: string }
  | { type: 'image'; value: Blob }
  | { type: 'json'; value: unknown }
  | string;

export type PermissionState = 'denied' | 'granted' | 'prompt' | 'unsupported';

export function isSupported(): boolean {
  return typeof navigator !== 'undefined' && 'clipboard' in navigator;
}

export function formatData(data: CopyData): string {
  if (typeof data === 'string') {
    return data;
  }
  if (data.type === 'json') {
    return JSON.stringify(data.value, null, 2);
  }
  if (data.type === 'image') {
    return '';
  }
  return data.value;
}

export async function copyToClipboard(data: CopyData): Promise<void> {
  if (!isSupported()) {
    throw new Error('Clipboard API not supported');
  }

  if (typeof data === 'string') {
    await navigator.clipboard.writeText(data);
    return;
  }

  if (data.type === 'html') {
    const blob = new Blob([data.value], { type: 'text/html' });
    // eslint-disable-next-line no-undef
    const item = new ClipboardItem({ 'text/html': blob });
    await navigator.clipboard.write([item]);
    return;
  }

  if (data.type === 'image') {
    // eslint-disable-next-line no-undef
    const item = new ClipboardItem({ [data.value.type]: data.value });
    await navigator.clipboard.write([item]);
    return;
  }

  const text = formatData(data);
  await navigator.clipboard.writeText(text);
}

export async function getClipboardPermission(): Promise<PermissionState> {
  if (!isSupported()) {
    return 'unsupported';
  }

  try {
    const result = await navigator.permissions.query({
      // eslint-disable-next-line no-undef
      name: 'clipboard-write' as PermissionName,
    });
    return result.state as PermissionState;
  } catch {
    return 'granted';
  }
}

export const copy = copyToClipboard;