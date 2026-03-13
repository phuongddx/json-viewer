import { useCallback, useRef, useState, useEffect } from 'react';
import { useFileImport, usePasteHandler } from '../../hooks/use-file-import';
import styles from './file-drop-zone.module.css';

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
          <span className={styles.icon}>&#9888;</span>
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
          <span className={styles.icon}>&#10003;</span>
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
          <span className={styles.icon}>&#128196;</span>
          <p className={styles.mainText}>Drop JSON file here</p>
          <p className={styles.subText}>or click to browse</p>
          <p className={styles.hint}>You can also paste JSON from clipboard</p>
        </div>
      )}
    </div>
  );
}
