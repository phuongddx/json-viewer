# Browser File Import APIs Research Report

## Overview
Research on modern browser APIs for client-side file import in a React-based JSON viewer application.

---

## 1. FileReader API

### Purpose
Read file contents asynchronously in the browser without server upload.

### Key Methods
| Method | Description |
|--------|-------------|
| `readAsText(file, encoding)` | Read as text (UTF-8 default) |
| `readAsDataURL(file)` | Read as base64 data URL |
| `readAsArrayBuffer(file)` | Read as binary array buffer |

### Usage Pattern
```javascript
const reader = new FileReader();
reader.onload = (e) => {
  const content = e.target.result; // String for text
  try {
    const json = JSON.parse(content);
    // Handle parsed JSON
  } catch (err) {
    // Handle parse error
  }
};
reader.onerror = (err) => { /* Handle error */ };
reader.readAsText(file);
```

### JSON-Specific Considerations
- Use `readAsText()` for JSON files
- Always wrap in try-catch for JSON.parse()
- Consider encoding (UTF-8 works for most cases)
- Handle large files with streaming/chunking if needed

---

## 2. Drag and Drop API

### Core Events
| Event | When Fired |
|-------|------------|
| `dragenter` | Drag enters drop zone |
| `dragover` | Drag over drop zone (must call preventDefault) |
| `dragleave` | Drag leaves drop zone |
| `drop` | File is dropped |

### Critical Implementation Detail
**Must call `e.preventDefault()` on `dragover` to enable drop.**

```javascript
const handleDragOver = (e) => {
  e.preventDefault(); // Required to allow drop
  e.stopPropagation();
};

const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  const files = e.dataTransfer.files;
  // Process files
};
```

### File Access from DataTransfer
```javascript
const files = e.dataTransfer.files; // FileList object
if (files.length > 0) {
  const file = files[0];
  // Check file.type or extension
  if (file.type === 'application/json' || file.name.endsWith('.json')) {
    // Process
  }
}
```

---

## 3. Clipboard API (Paste)

### Paste Event Handler
```javascript
const handlePaste = (e) => {
  const clipboardData = e.clipboardData || window.clipboardData;
  const text = clipboardData.getData('text');

  if (text) {
    try {
      const json = JSON.parse(text);
      // Handle parsed JSON
    } catch (err) {
      // Not valid JSON - ignore or show error
    }
  }

  // Check for pasted files
  const items = clipboardData.items;
  for (let item of items) {
    if (item.type.startsWith('application/json') ||
        item.kind === 'file') {
      // Get file and read
    }
  }
};
```

### Modern Clipboard API (Async)
```javascript
navigator.clipboard.readText().then(text => {
  // Handle pasted text
});

navigator.clipboard.read().then(items => {
  for (const item of items) {
    if (item.types.includes('application/json')) {
      item.getType('application/json').then(blob => {
        // Process JSON file from clipboard
      });
    }
  }
});
```

**Note:** Requires HTTPS and may need user permission.

---

## 4. File Input Handling

### HTML Input Element
```jsx
<input
  type="file"
  accept=".json,application/json"
  onChange={handleFileSelect}
  style={{ display: 'none' }}
  ref={fileInputRef}
/>

<button onClick={() => fileInputRef.current.click()}>
  Load JSON
</button>
```

### Change Handler
```javascript
const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    readFile(file);
  }
  // Reset input to allow re-selecting same file
  e.target.value = '';
};
```

---

## 5. jsonviewer.stack.hu Analysis

### Observed Features
- "Load JSON data" button (mentioned in April 2025 update)
- Likely implements: file input + drag-drop + paste
- Simple, accessible UI approach

### Recommended Implementation Strategy

#### Clean Architecture for React JSON Viewer
```typescript
// Hook-based approach
interface UseFileImport {
  file: File | null;
  content: string | null;
  error: string | null;
  parseResult: unknown;
  // Methods
  loadFromFile: (file: File) => void;
  loadFromText: (text: string) => void;
  loadFromDrop: (e: React.DragEvent) => void;
  loadFromPaste: (e: React.ClipboardEvent) => void;
  clear: () => void;
}
```

#### Component Structure
1. **DropZone** - Visual drag-drop area with file input fallback
2. **PasteHandler** - Global paste listener or within DropZone
3. **FileReader** - Utility to read file as text
4. **JsonParser** - Parse and validate JSON
5. **ErrorDisplay** - Show parse/validation errors

#### Recommended Pattern
```tsx
// Single unified import handler
const handleFileImport = (source: 'file' | 'drop' | 'paste', data: File | string) => {
  const text = typeof data === 'string'
    ? data
    : await readFileAsText(data);

  try {
    const parsed = JSON.parse(text);
    setJsonData(parsed);
  } catch (e) {
    setError('Invalid JSON');
  }
};
```

---

## 6. Best Practices Summary

| Practice | Recommendation |
|----------|----------------|
| File type validation | Check `file.type` and extension |
| Error handling | Try-catch JSON.parse, show user feedback |
| Large files | Consider streaming or size limits |
| UX | Show loading state, progress for large files |
| Accessibility | Keyboard support, ARIA labels |
| Mobile | File input fallback for touch devices |

---

## Unresolved Questions

1. Does jsonviewer.stack.hu support reading files from clipboard paste (as files, not just text)?
2. What file size limits do they enforce?
3. Do they support JSON with comments (JSONC)?

---

## References
- MDN: FileReader API
- MDN: Drag and Drop API
- MDN: Clipboard API
- React DnD libraries: react-dropzone (popular for React)