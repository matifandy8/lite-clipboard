/**
 * React hook for clipboard operations.
 * Provides reactive state and callbacks for clipboard interactions.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type { CopyInput } from '../core.js';
import { copy, isSupported } from '../core.js';

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

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { onSuccess, onError, timeout = 2000 } = options;
  const supported = isSupported();

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(
    async (input: CopyInput): Promise<void> => {
      // Clear any pending timer
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // Check support first
      if (!supported) {
        const message = 'Clipboard API is not available in this environment';
        setError(message);
        setCopied(false);
        onError?.(message);
        return;
      }

      // Perform the copy
      const result = await copy(input);

      if (result.success) {
        setCopied(true);
        setError(null);
        onSuccess?.();

        // Auto-reset copied state after timeout
        timerRef.current = setTimeout(() => {
          setCopied(false);
          timerRef.current = null;
        }, timeout);
      } else {
        setCopied(false);
        setError(result.error ?? 'Unknown error');
        onError?.(result.error ?? 'Unknown error');
      }
    },
    [onSuccess, onError, timeout, supported],
  );

  return {
    copied,
    error,
    supported,
    copy: handleCopy,
  };
}
