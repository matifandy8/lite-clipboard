/**
 * React hook for clipboard operations.
 * Provides reactive state and callbacks for clipboard interactions.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { copy, isSupported } from '../core.js';
export function useClipboard(options = {}) {
    const { onSuccess, onError, timeout = 2000 } = options;
    const supported = isSupported();
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);
    const timerRef = useRef(null);
    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);
    const handleCopy = useCallback(async (input) => {
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
        }
        else {
            setCopied(false);
            setError(result.error ?? 'Unknown error');
            onError?.(result.error ?? 'Unknown error');
        }
    }, [onSuccess, onError, timeout, supported]);
    return {
        copied,
        error,
        supported,
        copy: handleCopy,
    };
}
