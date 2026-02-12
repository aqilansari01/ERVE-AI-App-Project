# NAV 1-Pager: Word → HTML/PDF Rebuild Plan

## Summary
Replace Word document (.docx) output with HTML-rendered PDF using html2pdf.js. Add comprehensive manual input form. A4 landscape, strict single page.

## New Files
1. `src/utils/navDataModel.js` — Centralized data shape + defaults
2. `src/components/NavInputForm.jsx` — Multi-section manual input form
3. `src/components/NavOnePagerTemplate.jsx` — HTML/CSS template for PDF (inline styles, not Tailwind)
4. `src/components/NavPreview.jsx` — Scaled preview + PDF trigger
5. `src/services/pdfGenerator.js` — html2pdf.js wrapper

## Modified Files
1. `package.json` — Add html2pdf.js, remove docx
2. `App.jsx` — Multi-step wizard (input → processing → review → result)
3. `FileUpload.jsx` — Remove template dropzone, 3 optional uploads
4. `DownloadResult.jsx` — PDF MIME type
5. `claude.js` — Add extractQuarterlyFinancials + generateCompanyUpdate, remove synthesizeNAVDocument
6. `documentProcessor.js` — Return structured data instead of Word blob
7. `fileValidation.js` — Remove template type

## Deleted Files
1. `src/services/navGenerator.js` — Replaced by pdfGenerator.js

## Implementation Order
1. Dependencies (html2pdf.js in, docx out)
2. Data model
3. HTML template component
4. PDF generator service
5. Input form component
6. Update FileUpload
7. Update AI services
8. Update document processor
9. Preview component
10. Update DownloadResult
11. Update fileValidation
12. Rewrite App.jsx
13. Delete navGenerator.js
