import { useCallback, useEffect, useRef, useState } from 'react';
import { copyToClipboard, isSupported } from '../core.js';
export function useClipboard(options = {}) {
    const { onError, onSuccess, timeout = 2000 } = options;
    const supported = isSupported();
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);
    const timerRef = useRef(null);
    const handleCopy = useCallback(async (data) => {
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
        }
        catch (err) {
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
