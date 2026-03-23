import { useCallback, useEffect, useRef, useState } from 'react';

import type { CopyData } from '../core.js'
import { copyToClipboard, isSupported } from '../core.js'

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

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { onError, onSuccess, timeout = 2000 } = options;
  const supported = isSupported();

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const timerRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  const handleCopy = useCallback(async (data: CopyData): Promise<void> => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!supported) {
      const message = 'Clipboard API not supported';
      setError(message);
      onError?.(message);
      return;
    }

    try {
      await copyToClipboard(data);
      setCopied(true);
      setError(null);
      onSuccess?.();

      timerRef.current = setTimeout(() => {
        setCopied(false);
      }, timeout);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      onError?.(message);
    }
  }, [onSuccess, onError, timeout, supported]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return {
    copied,
    copy: handleCopy,
    error,
    supported,
  };
}
