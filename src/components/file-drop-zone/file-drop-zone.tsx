import { useCallback, useRef, useState, useEffect } from 'react';
import { useFileImport, usePasteHandler } from '../../hooks/use-file-import';
import styles from './file-drop-zone.module.css';

/* Inline SVG icons — no emoji or HTML entities */
const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const CheckIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const WarningIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

export interface FileDropZoneProps {
  onDataLoaded: (data: unknown) => void;
  className?: string;
}

export function FileDropZone({ onDataLoaded, className }: FileDropZoneProps) {
  const { data, error, isLoading, loadFromFile, loadFromDrop, clear } = useFileImport();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notify parent when data is loaded
  const handleDataLoaded = useCallback((loadedData: unknown) => {
    if (loadedData) {
      onDataLoaded(loadedData);
    }
  }, [onDataLoaded]);

  // Update parent when data changes (use useEffect to avoid render-side-effect)
  useEffect(() => {
    if (data && !error) {
      handleDataLoaded(data);
    }
  }, [data, error, handleDataLoaded]);

  // Handle paste events globally
  const handlePaste = useCallback((e: ClipboardEvent) => {
    // Only handle paste when this component is focused or no input is focused
    const activeElement = document.activeElement;
    const isInputFocused = activeElement?.tagName === 'INPUT' ||
                           activeElement?.tagName === 'TEXTAREA';

    if (!isInputFocused) {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

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

      const text = clipboardData.getData('text');
      if (text) {
        try {
          const parsed = JSON.parse(text.trim());
          onDataLoaded(parsed);
        } catch {
          // Invalid JSON in clipboard, ignore silently
        }
      }
    }
  }, [loadFromFile, onDataLoaded]);

  usePasteHandler(handlePaste);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    loadFromDrop(e);
  }, [loadFromDrop]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      loadFromFile(files[0]);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [loadFromFile]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    clear();
    onDataLoaded(null);
  }, [clear, onDataLoaded]);

  return (
    <div
      className={`${styles.dropZone} ${isDragOver ? styles.dragOver : ''} ${error ? styles.error : ''} ${className || ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileSelect}
        className={styles.hiddenInput}
      />

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}><WarningIcon /></div>
          <p>{error}</p>
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearBtn}
          >
            Clear
          </button>
        </div>
      ) : data ? (
        <div className={styles.success}>
          <div className={styles.successIcon}><CheckIcon /></div>
          <p>JSON loaded successfully</p>
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearBtn}
          >
            Load different file
          </button>
        </div>
      ) : (
        <div className={styles.placeholder}>
          <div className={styles.icon}><UploadIcon /></div>
          <p className={styles.mainText}>Drop JSON file here</p>
          <p className={styles.subText}>or click to browse</p>
          <p className={styles.hint}>Paste JSON from clipboard anytime</p>
        </div>
      )}
    </div>
  );
}
