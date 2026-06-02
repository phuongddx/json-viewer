import { useCallback, useRef, useState } from 'react';
import styles from './url-fetch.module.css';

/* Inline SVG icons — no emoji, no external dependency */
const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export interface UrlFetchProps {
  onDataLoaded: (data: unknown) => void;
  className?: string;
}

/** Public CORS proxies as a fallback — user can toggle this on/off */
const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

export function UrlFetch({ onDataLoaded, className }: UrlFetchProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [useCorsProxy, setUseCorsProxy] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchJson = useCallback(async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Please enter a URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(trimmedUrl);
    } catch {
      setError('Invalid URL — must include protocol (https://...)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const tryFetch = async (fetchUrl: string): Promise<Response> => {
      const response = await fetch(fetchUrl, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    };

    try {
      let response: Response;

      if (useCorsProxy) {
        // Try each CORS proxy in order
        let lastError: Error | null = null;
        let succeeded = false;
        for (const proxyFn of CORS_PROXIES) {
          try {
            response = await tryFetch(proxyFn(trimmedUrl));
            succeeded = true;
            break;
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
          }
        }
        if (!succeeded) {
          throw lastError || new Error('All CORS proxies failed');
        }
      } else {
        try {
          response = await tryFetch(trimmedUrl);
        } catch (err) {
          // If it looks like a CORS error, suggest using the proxy
          const errMsg = err instanceof Error ? err.message : String(err);
          if (
            errMsg.includes('Failed to fetch') ||
            errMsg.includes('NetworkError') ||
            errMsg.includes('CORS') ||
            errMsg.includes('blocked')
          ) {
            setError(
              'Request blocked (likely CORS). Try enabling the CORS proxy option below.'
            );
            setIsLoading(false);
            return;
          }
          throw err;
        }
      }

      const text = await response!.text();

      // Try to parse as JSON
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          'Response is not valid JSON. The URL may return HTML or other non-JSON content.'
        );
      }

      onDataLoaded(data);
      setSuccess('JSON loaded successfully');
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Fetch failed: ${message}`);
      setSuccess(null);
    } finally {
      setIsLoading(false);
    }
  }, [url, useCorsProxy, onDataLoaded]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isLoading) {
        fetchJson();
      }
    },
    [fetchJson, isLoading]
  );


  if (!isOpen) {
    return (
      <div className={`${className || ''}`}>
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
        >
          Fetch JSON from URL...
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <span className={styles.title}>
          <LinkIcon /> Fetch from URL
        </span>
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => {
            setIsOpen(false);
            setError(null);
            setSuccess(null);
          }}
        >
          Close
        </button>
      </div>

      <div className={styles.row}>
        <input
          ref={inputRef}
          type="url"
          className={styles.input}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
            setSuccess(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="https://api.example.com/data.json"
          disabled={isLoading}
          spellCheck={false}
          aria-label="JSON URL to fetch"
        />
        <button
          type="button"
          className={styles.fetchBtn}
          onClick={fetchJson}
          disabled={isLoading || !url.trim()}
        >
          {isLoading ? (
            <>
              <span className={styles.spinner} />
              Fetching...
            </>
          ) : (
            'Fetch'
          )}
        </button>
      </div>

      <div className={styles.options}>
        <label className={styles.corsLabel}>
          <input
            type="checkbox"
            className={styles.corsCheckbox}
            checked={useCorsProxy}
            onChange={(e) => setUseCorsProxy(e.target.checked)}
            disabled={isLoading}
          />
          Use CORS proxy
        </label>
      </div>

      {error && <div className={styles.error} role="alert">{error}</div>}
      {success && <div className={styles.success} role="status">{success}</div>}
    </div>
  );
}
