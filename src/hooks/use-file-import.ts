import { useState, useCallback, useEffect } from 'react';

export interface UseFileImportReturn {
  data: unknown;
  error: string | null;
  isLoading: boolean;
  loadFromFile: (file: File) => Promise<void>;
  loadFromText: (text: string) => void;
  loadFromDrop: (e: React.DragEvent) => void;
  loadFromPaste: (e: ClipboardEvent) => void;
  clear: () => void;
}

const JSON_MIME_TYPES = ['application/json', 'text/plain'];
const JSON_EXTENSIONS = ['.json'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

function isValidJsonFile(file: File): boolean {
  const hasValidMime = JSON_MIME_TYPES.includes(file.type);
  const hasValidExt = JSON_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
  return hasValidMime || hasValidExt;
}

function parseJson(text: string): { data: unknown; error: string | null } {
  try {
    const parsed = JSON.parse(text);
    return { data: parsed, error: null };
  } catch {
    return { data: null, error: 'Invalid JSON format. Please check the file content.' };
  }
}

export function useFileImport(): UseFileImportReturn {
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadFromFile = useCallback(async (file: File): Promise<void> => {
    setError(null);

    if (!isValidJsonFile(file)) {
      setError('Invalid file type. Please upload a .json file.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    setIsLoading(true);

    try {
      const text = await readFileAsText(file);
      const result = parseJson(text);

      if (result.error) {
        setError(result.error);
        setData(null);
      } else {
        setData(result.data);
      }
    } catch {
      setError('Failed to read file. Please try again.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFromText = useCallback((text: string): void => {
    setError(null);
    setIsLoading(true);

    const result = parseJson(text.trim());

    if (result.error) {
      setError(result.error);
      setData(null);
    } else {
      setData(result.data);
    }

    setIsLoading(false);
  }, []);

  const loadFromDrop = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) {
      setError('No file detected in drop.');
      return;
    }

    const file = files[0];
    loadFromFile(file);
  }, [loadFromFile]);

  const loadFromPaste = useCallback((e: ClipboardEvent): void => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // Check for file paste first (e.g., copied file from file manager)
    const items = clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          loadFromFile(file);
          return;
        }
      }
    }

    // Fall back to text paste (JSON string)
    const text = clipboardData.getData('text');
    if (text) {
      loadFromText(text);
    }
  }, [loadFromFile, loadFromText]);

  const clear = useCallback((): void => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    loadFromFile,
    loadFromText,
    loadFromDrop,
    loadFromPaste,
    clear,
  };
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };

    reader.onerror = () => {
      reject(new Error('FileReader error'));
    };

    reader.readAsText(file);
  });
}

// Hook for global paste listener
export function usePasteHandler(handler: (e: ClipboardEvent) => void): void {
  useEffect(() => {
    document.addEventListener('paste', handler);
    return () => {
      document.removeEventListener('paste', handler);
    };
  }, [handler]);
}
