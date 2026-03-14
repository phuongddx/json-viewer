---
title: "Phase 4: File Import - File Picker, Drag & Drop, Clipboard"
description: "Implement all three file import methods using browser APIs"
status: completed
priority: P1
effort: 4h
branch: main
tags: [file-import, drag-drop, clipboard]
created: 2026-03-13
---

## Context

- **Depends on:** Phase 1 (Setup)
- **Purpose:** Add file import via file picker, drag & drop, and clipboard paste

---

## Overview

- **Priority:** P1
- **Current status:** completed
- **Brief description:** Create unified file import system supporting all three methods using browser FileReader, Drag & Drop, and Clipboard APIs

---

## Key Insights

1. Use FileReader API to read files as text
2. Drag & Drop: must call `preventDefault()` on `dragover` event
3. Clipboard: handle both text paste and file paste
4. Unified hook interface for all import methods

---

## Requirements

### Functional
- **File picker:** HTML input type="file" with .json accept
- **Drag & drop:** Drop zone that accepts .json files
- **Clipboard paste:** Ctrl+V to paste JSON text or file
- File validation: only accept .json files or text that parses as JSON

### Non-functional
- Visual feedback during drag (highlight drop zone)
- Error handling for invalid files
- Works on mobile (file input fallback)

---

## Architecture

```
src/
├── hooks/
│   └── use-file-import.ts              # Unified file import hook
└── components/
    └── file-drop-zone/
        ├── file-drop-zone.tsx          # Drop zone component
        └── file-drop-zone.module.css    # Drop zone styles
```

---

## Implementation Steps

1. **Create useFileImport hook** (`src/hooks/use-file-import.ts`)
   - Interface:
     ```typescript
     interface UseFileImport {
       file: File | null;
       content: string | null;
       parsedData: unknown;
       error: string | null;
       loadFromFile: (file: File) => Promise<void>;
       loadFromText: (text: string) => void;
       loadFromDrop: (e: React.DragEvent) => void;
       loadFromPaste: (e: React.ClipboardEvent) => void;
       clear: () => void;
     }
     ```
   - Implement FileReader logic
   - Validate JSON with JSON.parse()
   - Error handling

2. **Create FileDropZone component** (`src/components/file-drop-zone/file-drop-zone.tsx`)
   - Hidden file input for picker
   - Drop area with visual feedback
   - "Load JSON" button to trigger file picker
   - Props for onJsonLoaded callback

3. **Style component** (`src/components/file-drop-zone/file-drop-zone.module.css`)
   - Dashed border drop zone
   - Drag-over highlight state
   - Button styles

4. **Implement drag & drop**
   - `onDragOver`: preventDefault + setDragging state
   - `onDragLeave`: clear dragging state
   - `onDrop`: preventDefault + read file

5. **Implement clipboard paste**
   - `onPaste` handler on document or component
   - Check for text or file in clipboard data

6. **Test all three methods**

---

## File Ownership (Exclusive)

| File | Phase Owner |
|------|-------------|
| `src/hooks/use-file-import.ts` | Phase 4 |
| `src/components/file-drop-zone/*` | Phase 4 |
| `src/components/json-input/*` | Phase 2 (read only) |

---

## Key Implementation Details

### FileReader Pattern
```typescript
const reader = new FileReader();
reader.onload = (e) => {
  const content = e.target.result as string;
  try {
    const json = JSON.parse(content);
    onJsonLoaded(json);
  } catch (err) {
    setError('Invalid JSON');
  }
};
reader.readAsText(file);
```

### Drag & Drop Pattern
```typescript
const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault(); // Required!
  e.stopPropagation();
};
const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  loadFromFile(file);
};
```

---

## Todo List

- [x] Create use-file-import.ts hook
- [x] Create file-drop-zone.tsx component
- [x] Create file-drop-zone.module.css
- [x] Implement file picker (input type="file")
- [x] Implement drag & drop handlers
- [x] Implement clipboard paste handler
- [x] Add file validation (.json check)
- [x] Add error display
- [x] Test all three import methods

---

## Success Criteria

- File picker opens and loads .json files
- Drag & drop .json file onto drop zone works
- Paste JSON text from clipboard works
- Invalid files show error message

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Clipboard API needs HTTPS | Low | Warn users, works in dev |
| Large file handling | Medium | Add size limit (e.g., 5MB) |
| Mobile drag & drop | Low | File input fallback |

---

## Security Considerations

- No server upload (client-side only)
- FileReader is safe browser API
- Validate file types before processing

---

## Next Steps

After Phase 4:
- Phase 5: Integration & Polish
