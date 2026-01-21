# NAV 1-Pager Generator

An AI-powered web application for venture capital firms to automate quarterly NAV (Net Asset Value) 1-pager generation.

## Features

- **Multi-Document Upload**: Support for Word, PDF, and Excel documents
- **AI-Powered Analysis**: Uses Claude API to extract and synthesize information from multiple sources
- **Automated Generation**: Generates complete NAV 1-pagers based on templates, prior quarters, board notes, and financials
- **Cloud Storage**: Secure document storage using Supabase
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **One-Click Download**: Export generated NAV 1-pagers as Word documents

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (file storage)
- **AI**: Anthropic Claude API
- **Document Processing**:
  - mammoth (Word documents)
  - xlsx (Excel spreadsheets)
  - Claude API (PDF extraction and analysis)
- **Document Generation**: docx library
- **Deployment**: Vercel

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- An Anthropic API key
- npm or yarn package manager

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ERVE-AI-App-Project
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Configure Supabase

1. Create a new project in [Supabase](https://supabase.com)
2. Go to **Storage** and create a new bucket called `nav-documents`
3. Set the bucket to **Public** or configure appropriate policies
4. Get your project URL and anon key from **Settings** > **API**

### 4. Get Anthropic API Key

1. Sign up at [Anthropic Console](https://console.anthropic.com)
2. Create an API key
3. Note: Using Claude API in the browser requires `dangerouslyAllowBrowser: true` (only for development)

### 5. Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
cd frontend
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 6. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

1. **Upload Documents**: Drag and drop or click to upload:
   - NAV Template (Word document)
   - Prior Quarter's NAV (Word or PDF)
   - Board Notes (Word or PDF)
   - Financials (Excel or PDF)

2. **Generate**: Click "Generate NAV 1-Pager" to start processing

3. **Download**: Once complete, download your generated NAV 1-pager as a Word document

## Project Structure

```
ERVE-AI-App-Project/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx
│   │   │   ├── ProcessingStatus.jsx
│   │   │   └── DownloadResult.jsx
│   │   ├── services/
│   │   │   ├── supabase.js
│   │   │   ├── claude.js
│   │   │   ├── documentProcessor.js
│   │   │   └── navGenerator.js
│   │   ├── utils/
│   │   │   ├── fileValidation.js
│   │   │   └── documentParser.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── vercel.json
└── README.md
```

## Deployment to Vercel

### Prerequisites
- Vercel account
- GitHub repository

### Steps

1. **Push to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set root directory to `frontend`
   - Add environment variables in project settings

3. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables** in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ANTHROPIC_API_KEY`

5. **Deploy**: Click "Deploy"

## Security Considerations

⚠️ **Important**: The current implementation uses Claude API directly from the browser with `dangerouslyAllowBrowser: true`. For production:

1. **Create a Backend API**: Build a Node.js/Express backend to handle Claude API calls
2. **Move API Keys Server-Side**: Never expose API keys in the browser
3. **Implement Authentication**: Add user authentication with Supabase Auth
4. **Use Row Level Security**: Configure Supabase RLS policies
5. **Rate Limiting**: Implement rate limiting to prevent abuse

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Files

- **App.jsx**: Main application component with state management
- **documentProcessor.js**: Orchestrates the entire document processing pipeline
- **claude.js**: Handles all Claude API interactions
- **supabase.js**: Manages file uploads and storage
- **navGenerator.js**: Generates the final Word document

## Troubleshooting

### Common Issues

**API Key Errors**:
- Verify environment variables are correctly set
- Restart the development server after changing `.env`

**File Upload Errors**:
- Check Supabase bucket permissions
- Verify bucket name matches the code (`nav-documents`)

**Document Processing Errors**:
- Ensure uploaded files are not corrupted
- Check file size limits (default: 10MB)

**Build Errors**:
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## Future Enhancements

- [ ] Backend API for secure Claude API calls
- [ ] User authentication and multi-tenancy
- [ ] Document template management
- [ ] Historical NAV tracking and analytics
- [ ] Email notifications when processing completes
- [ ] Batch processing for multiple companies
- [ ] Custom branding and template customization
- [ ] Export to additional formats (PDF, Excel)

## License

MIT

## Support

For issues and questions, please open an issue on GitHub or contact your development team.
