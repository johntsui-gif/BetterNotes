# BetterNotes feature implementation status

Release: 6 November 2026

This release is a substantial expansion of BetterNotes, not full Goodnotes parity. Every one of the 73 feature rows in the supplied analysis is accounted for below. “Implemented” means a working implementation is present; it does not imply independent testing on every device. “Partial” identifies the exact boundary. “Not implemented” is an explicit gap, not a claim that the feature is impossible forever.

## Where to find the new features

- **New notebook** now opens a choice of notebook, expandable whiteboard, text document or study set.
- In a notebook, use **Tool settings**, **Layers**, **Pages & outline**, **Insert & study**, **Export** and **Audio recordings** in the toolbar. Hover or long press icons for their names.
- Choose **Lasso**, select objects, then use the selection bar. On desktop, right-click a BetterNotes object while in an editing mode to select it.
- Library actions include **Trash**, **Manage folders**, **Merge notebooks**, **Export folder**, **Search contents**, **Settings** and **Backups & sharing**.
- Notebook options include **Share PDF via Google Drive**, with separate private/public snapshot choices. Sharing is a snapshot, not a live collaborative document.
- Keyboard shortcuts: Ctrl/Cmd+Z and Shift+Ctrl/Cmd+Z; Ctrl/Cmd+C/X/V for selections; Delete; P/H/E/L/V/T for tools; arrow keys/Page Up/Page Down; Home/End. Shortcuts do not override input fields.

## Important operational boundaries

Existing notebooks and PDF page mappings are retained. Page deletion is now recoverable. Download an editable backup before extensive changes to important notebooks. The app stores data in browser storage; clearing site data can remove unsynced work.

Google Drive authorization, microphone permission, hardware stylus features, physical iOS/macOS devices, and unattended backup timing were not end-to-end tested in this environment. Google OAuth configuration is still required. No cloud credentials or account permissions were changed during this release.

Public PDF sharing and independent Drive snapshots are implemented but unverified against a signed-in account. They only run when the user explicitly activates them. Scheduled backups are off by default.

No encryption is provided. Do not treat a hidden layer, deleted page, or Trash purge as secure redaction: original PDF bytes, prior Drive revisions, and backups can retain content.

## Feature-by-feature comparison

| # | Feature from supplied analysis | Status | Implementation or remaining gap |
|---|---|---|---|
| 1 | Input Hardware — Apple Pencil Pro Squeeze | Not implemented | Apple Pencil Pro squeeze needs native Apple Pencil integration. A dependable browser event is not exposed by the current app stack; no pretend toggle is included. |
| 2 | Input Hardware — Apple Pencil Pro Barrel Roll | Not implemented | Browser PointerEvent rotation support is not a guarantee of Apple Pencil barrel-roll delivery. Native integration and hardware validation are needed; pressure alone is supported. |
| 3 | Input Hardware — Mouse and Trackpad Support | Implemented | Mouse drawing, scrolling, right-click object selection, keyboard shortcuts and object commands. |
| 4 | Palm Rejection — Automatic Rejection | Partial | Stylus-only drawing and rejection of large touch contacts. This is a browser-level heuristic, not Goodnotes-quality palm classification. Physical stylus testing remains necessary. |
| 5 | Palm Rejection — Posture Configuration | Partial | Left/right dominant-hand preference changes command alignment. No graphical posture classifier or predictive palm region model. |
| 6 | Palm Rejection — Sensitivity Levels | Partial | Stylus-only and Ignore stylus options, plus fixed large-touch rejection. Three calibrated palm sensitivity levels require real-device validation and are not provided. |
| 7 | Pen Tool — Fountain Pen | Partial | Pressure-varying vector strokes with a response control. No calibrated tip-sharpness, speed dynamics or barrel-roll nib model. |
| 8 | Pen Tool — Ballpoint Pen | Implemented | Constant-width vector ballpoint strokes. |
| 9 | Pen Tool — Brush Pen | Partial | Pressure-sensitive brush width and response setting. Not a full calligraphic nib or tilt simulation. |
| 10 | Pen Settings — Stroke Style | Implemented | Solid, dashed and dotted stroke styles in Tool settings. |
| 11 | Pen Settings — Color Presets | Partial | Color picker and up to 12 editable hex presets. Presets are shared across tools; no eyedropper or separate per-tool palettes. |
| 12 | Pen Settings — Thickness Presets | Partial | Three configurable width presets. Values are page coordinate units, not physically calibrated millimeters across screens. |
| 13 | Highlighter — Freehand Highlight | Implemented | Translucent highlights render beneath other marks within their layer. |
| 14 | Highlighter — Draw in Straight Line | Partial | Optional horizontal/vertical snapping when the stroke finishes. No graduated stabilization slider or intent classifier. |
| 15 | Eraser Tool — Standard Eraser | Partial | Radius-based erasing of BetterNotes ink. It cannot erase handwriting baked into an imported PDF or image. Standard behavior uses the stroke mode rather than a separate bitmap eraser. |
| 16 | Eraser Tool — Precision Eraser | Partial | Splits sampled freehand strokes around the eraser. This is vector segment removal, not exact pixel subtraction; rotated objects and source PDF ink are not precision-erased. |
| 17 | Eraser Tool — Stroke Eraser | Implemented | Deletes touched strokes on the active layer, respecting locks and the highlighter filter. |
| 18 | Eraser Settings — Auto-Deselect | Implemented | Optional return to the previous writing tool after erasing. |
| 19 | Eraser Settings — Erase Highlighter Only | Implemented | Restricts erasing to BetterNotes highlighter marks. |
| 20 | Tape Tool — Hide Content | Implemented | Opaque tape strokes hide answers; current color and width control new tape. |
| 21 | Tape Tool — Custom Patterns | Implemented | Insert & study → Tape appearance imports a repeating image pattern. Images are normalized to PNG. |
| 22 | Tape Tool — Reveal Content | Implemented | Tap tape in Read mode to reveal/re-cover. Remove all tape is available under Insert & study. Exported tape remains covered. |
| 23 | Lasso Tool — Freehand Lasso | Implemented | Freehand lasso selects objects by their bounds center on the active layer, with type filters. This is geometric selection, not semantic handwriting selection. |
| 24 | Lasso Tool — Rectangular Lasso | Implemented | Rectangular selection with the same filters. |
| 25 | Lasso Actions — Object Manipulation | Partial | Move by dragging, resize/rotate numerically, copy/cut/paste/delete/recolor, PNG selection export, front/back and left/center/top alignment. No resize/rotate handles or full alignment/distribution suite. |
| 26 | Lasso Actions — Contextual Conversion | Partial | Editing selected text and sticky notes is available. Handwriting-to-text and handwriting-to-math need recognition models, language support and evaluation; not implemented. |
| 27 | Layers — Layer Management | Implemented | Five named layers, active-layer editing and show/hide controls. Layer panel is opened or dismissed as needed. |
| 28 | Layers — Collaborative Visibility | Partial | Visibility is local to the current browser session. Real-time collaboration and collaborator-specific settings do not exist. |
| 29 | Object Control — Object Locking | Implemented | Images, shapes, text, sticky notes and tape can be locked/unlocked. Handwriting and highlighter ink are excluded. Locked objects cannot be moved or erased. |
| 30 | Object Control — Arrange Order | Implemented | Front/back ordering within layer ordering. Highlighters intentionally remain below other marks. |
| 31 | Elements — Asset Library | Implemented | Named reusable selections, collections, rename/delete and insertion. Stored as a syncable elements notebook. |
| 32 | Elements — GIPHY Integration | Not implemented | GIPHY search needs an API integration, credentials, service terms and attribution. Local GIF import is converted to a static image; animated canvas assets are not supported. |
| 33 | Notebooks — Dynamic Templates | Implemented | Blank, lined, grid and dotted templates; paper/line colors, spacing, A4/Letter/landscape/square sizes. Templates apply to blank pages, not an imported PDF background. |
| 34 | Notebooks — Page Management | Implemented | Add/delete/restore/duplicate/reorder pages, drag reordering, first/last/previous/next and direct page jump. PDF source-page mappings stay attached to pages. |
| 35 | Whiteboards — Infinite Canvas | Partial | Expandable finite whiteboard with zoom and scroll, up to a 20,000-unit dimension threshold. A truly unbounded, tiled canvas requires a different renderer and spatial indexing. |
| 36 | Whiteboards — Minimap Navigation | Partial | Clickable minimap, fit and expand controls. No drag viewport, double-tap fit or separate visibility preference. |
| 37 | Text Documents — Block-Based Typing | Partial | Reorderable paragraph/headings/list/quote/code blocks, block-wide bold/italic/strikethrough and HTML export. Editing happens in a text dialog rather than a full inline rich-text editor. |
| 38 | Text Documents — Tables and Media | Partial | Tab-separated editable tables, image blocks and external video links. No slash-command menu, embedded video player or diagram editor. |
| 39 | Study Sets — Flashcard Creation | Partial | Typed questions/answers, image attachments, reveal, edit/delete, basic review intervals and due-first sorting. Freehand card authoring and advanced adaptive scheduling are not implemented. |
| 40 | Study Sets — Bulk Import | Implemented | CSV/TSV/TXT question-answer import, including quoted commas/newlines; CSV export. TXT is interpreted as tab-delimited columns. Use headerless input. |
| 41 | Stylus Gestures — Scribble to Erase | Not implemented | Scribble recognition needs a tested classifier to distinguish correction gestures from actual handwriting. Destructive guesswork would risk notes; use Eraser instead. |
| 42 | Stylus Gestures — Circle to Lasso | Not implemented | Circle-and-hold classification is not implemented. It needs a gesture state machine and stylus testing to avoid converting intentional circles into selections. |
| 43 | Stylus Gestures — Draw and Hold Shape | Not implemented | Draw-and-hold shape recognition is not implemented. Explicit line/rectangle/ellipse/arrow tools are available; robust recognition is additional engineering, not a platform impossibility. |
| 44 | Touch Gestures — Double Tap to Undo | Not implemented | Two-finger double-tap undo needs a tested multi-touch gesture arbiter to avoid collisions with scrolling and palm contacts. Toolbar and keyboard undo/redo work. |
| 45 | Navigation — Scrolling Direction | Partial | Scrollable current page plus explicit page navigation. No continuous multi-page vertical viewer or horizontal swipe/page-flip mode; that requires virtualized page layout and annotation routing. |
| 46 | Navigation — Zoom Window | Not implemented | A separate writing zoom window with auto-advance requires two synchronized editable viewports and handwriting position tracking. Standard zoom is available. |
| 47 | Navigation — Sidebar | Partial | Collapsible page organizer, lazy PDF page thumbnails, annotation/template miniatures, page labels and clickable PDF outline. Audio bookmarks have their own dialog; no unified sidebar tabs. |
| 48 | Navigation — Read-Only Mode | Partial | Read mode disables drawing, enables PDF text selection and links, and allows tape reveal. Editing tools remain visible for switching modes rather than hiding the entire toolbar. |
| 49 | Multi-Window — Split View Support | Partial | Multiple document tabs and separate browser windows; users can tile windows using their OS. No native iPad Dock split gesture or integrated two-document split pane. Avoid concurrently editing the same notebook in multiple windows. |
| 50 | Drag and Drop — Page Transfer | Not implemented | Cross-window page drag/drop with multi-page stacks is not implemented. Correct transfer must bring source PDF resources, annotations and stable link targets across documents; use editable backups and notebook merge instead. |
| 51 | Drag and Drop — Lasso Transfer | Partial | Lasso copy/cut/paste works across same-origin BetterNotes windows through a local clipboard. Physical cross-window drag/drop is not implemented. |
| 52 | Customization — Toolbar Layout | Implemented | Tool settings supports drag ordering and hiding tools; Read and Lasso remain available. Audio is a fixed workspace action. |
| 53 | Customization — Floating Menu Docking | Partial | Top/left/right toolbar docking via settings on large screens; compact layout on phones. No freely draggable secondary floating palette. |
| 54 | Customization — Undo/Redo Placement | Implemented | Left/right undo-group placement setting. |
| 55 | Handwriting AI — Spellcheck | Not implemented | Handwriting spellcheck and corrections in the user's writing style require recognition, language models and handwriting synthesis. No suitable validated offline model is bundled; paid/backend AI has not been provisioned. |
| 56 | Handwriting AI — Word Complete | Not implemented | Live handwriting word completion requires low-latency recognition and personalized stroke synthesis. This is not supplied by a static website or the PDF viewer. |
| 57 | File Structure — Custom Folders | Partial | Nested folder paths, rename, document movement, local emoji/color styling, folder-to-Trash action. Empty folders and appearance metadata remain local rather than syncing as independent Drive entities. |
| 58 | File Management — Move and Merge | Implemented | Notebook settings moves a document to a folder. Merge creates a new notebook and retains originals. Source PDF outlines are not transferred to merged notebooks. |
| 59 | File Management — Trash Bin | Partial | Recoverable notebooks, folder contents and pages; per-item purge. Empty folder records themselves are not recoverable items. Purge does not erase older cloud revisions or downloaded backups. |
| 60 | Search — Universal Search | Partial | Library title search plus Search contents scans text objects, text documents, study sets and extractable PDF text. It is an on-demand scan, not a background full-text index. |
| 61 | Search — Handwriting OCR Search | Not implemented | Handwriting/scanned-image OCR and language indexing need a recognition engine, model assets, background indexing and accuracy tests. PDFs with an existing text layer are searchable. |
| 62 | Security — Password Protection | Not implemented | No password protection or document encryption. Secure delivery needs authenticated encryption, key derivation/recovery, locked search/thumbnails, encrypted sync and backup exclusion throughout the data lifecycle. A cosmetic password prompt would not protect the data. |
| 63 | Synchronization — Google Drive Sync | Partial | Existing two-way Drive revisions, scheduled polling while open and conflict copies are retained. It is not instantaneous collaboration, does not run with the app closed, and an open notebook must be reopened to accept remote changes. OAuth client setup/reconnection is still required. |
| 64 | Backup — Auto-Backup | Partial | New one-way dated snapshots in a separate BetterNotes Backups Drive folder. No Dropbox, OneDrive or WebDAV connector; each needs its own authorization, API and CORS/deployment support. |
| 65 | Backup — Auto-Backup Format | Implemented | Drive snapshots include flattened PDF for notebooks/boards and editable BetterNotes backups for all workspace types. |
| 66 | Backup — Backup Frequency | Partial | Configurable 1–168-hour interval, default 24 hours, checked while the app is open and authorized. Browser/OS suspension and token expiry prevent guaranteed unattended backups. |
| 67 | Import — File Ingestion | Partial | PDF, JPEG/PNG, nested ZIP and BetterNotes backups. Native .goodnotes packages and Word/PowerPoint imports are not supported. Reliable Office rendering needs a conversion service or a substantial renderer; exporting to PDF is the current route. |
| 68 | Export — Format Selection | Implemented | Notebook PDF, current-page PNG, editable backup, folder ZIP; text-document HTML and study-set CSV. |
| 69 | PDF Export — Flattened PDF | Partial | Rasterized single-image pages with backgrounds/annotations included or excluded; no source hyperlinks. No OCR layer or handwriting-recognition export option. |
| 70 | PDF Export — Editable PDF | Partial | Vector-preserving export retains source PDFs and adds basic ink, shapes and Latin text as page-content vectors. Complex/rotated/non-Latin objects may rasterize. It does not create fully editable standard PDF ink-annotation objects, expose source annotations for editing, or guarantee third-party editability. Outlines and original internal links are retained only for unchanged source page order; removed on reordered/deleted/duplicated exports to avoid wrong destinations. Source PDF annotations are part of the source background toggle. |
| 71 | Export Options — Folder Export | Implemented | Folder ZIP exports preserve paths and empty folders; choose PDFs or editable backups. Unique filename suffixes avoid overwriting duplicate notebook titles. |
| 72 | Hyperlinks — Internal Linking | Partial | Selected objects link to stable page IDs in the same notebook. Links work in Read mode and vector PDF export; cross-notebook links are not implemented. |
| 73 | Hyperlinks — External Linking | Implemented | Selected objects can link to HTTP/HTTPS URLs. PDF viewer handles source links; vector export includes new links. Flattened export intentionally loses links. |

## Additional implementation and validation notes

Audio recording uses the browser microphone API, stores audio in the notebook, and supports manual page bookmarks. It is not synchronized ink replay or transcription. Keep the app open while recording; very large recordings increase sync and storage costs.

Automated checks passed for quoted CSV/TSV parsing, malformed CSV rejection, layer/lock/highlighter eraser filtering, precision stroke splitting, vector PDF page reorder/deletion/duplication, basic vector ink/text export, page-save failure atomicity, unsafe image rejection and lasso geometry. Browser checks covered page duplication, Trash/restore, templates, text insertion and reload persistence, object selection and copy/paste, flattened export, flashcard creation/reveal, PDF import/rendering, lazy PDF thumbnails and search-driven navigation. Hardware pressure response, large-library performance, cloud backup/sharing and native-device behavior require further validation.

The remaining work includes both genuine platform/service dependencies and feasible engineering not completed in this release. In particular, gesture recognition, continuous scrolling, a zoom-writing window and cross-window drag/drop are feasible future work; they are not being represented as technically impossible.

## Platform references

- Pointer input pressure: https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pressure
- Pointer input rotation: https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/twist
- Native Apple Pencil interaction APIs: https://developer.apple.com/documentation/uikit/apple-pencil-interactions
