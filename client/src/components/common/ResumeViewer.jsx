import { X, Download, FileText, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getPdfProxyUrl } from '../../services/api';

/**
 * Download a PDF from a URL with a proper filename.
 * Fetches through the proxy, forces blob type to application/pdf,
 * and triggers a download with the correct .pdf extension.
 */
export const downloadResume = async (url, studentName = 'Student') => {
  try {
    const proxyUrl = getPdfProxyUrl(url);
    const response = await fetch(proxyUrl);
    const blob = await response.blob();
    // Force the blob type to application/pdf to prevent .file downloads
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${studentName.replace(/\s+/g, '_')}-resume.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    // Fallback: open in new tab via proxy
    window.open(getPdfProxyUrl(url), '_blank');
  }
};

/**
 * ResumeViewer — Bauhaus-themed modal for viewing PDFs inline.
 * Uses backend /api/pdf-proxy to ensure correct Content-Type headers.
 *
 * Props:
 *   url         - Cloudinary PDF URL (raw)
 *   studentName - name for the header and download filename
 *   onClose     - callback to close modal
 */
const ResumeViewer = ({ url, studentName = 'Student', onClose }) => {
  const [useFallback, setUseFallback] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Proxy URL for inline viewing (correct Content-Type: application/pdf)
  const proxyUrl = getPdfProxyUrl(url);
  // Google Docs viewer as ultimate fallback (uses the *proxy* URL, not raw Cloudinary)
  const googleDocsUrl = `https://docs.google.com/gview?url=${encodeURIComponent(proxyUrl)}&embedded=true`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" id="resume-viewer-modal">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bauhaus-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl h-[90vh] mx-4 flex flex-col bg-white border-4 border-bauhaus-black shadow-hard-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-bauhaus-black text-white">
          <div className="flex items-center gap-3">
            {/* Bauhaus geometric accents */}
            <div className="w-3 h-3 rounded-full bg-bauhaus-red" />
            <div className="w-8 h-1 bg-bauhaus-blue" />
            <FileText className="w-4 h-4 text-bauhaus-yellow" />
            <span className="font-black uppercase tracking-wider text-sm">
              {studentName} — Resume
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* OPEN button — opens proxy URL in new tab */}
            <button
              onClick={() => window.open(proxyUrl, '_blank')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-bauhaus-blue text-white text-xs font-black border-2 border-bauhaus-blue hover:opacity-90 transition uppercase tracking-wider"
              title="Open in new tab"
            >
              <ExternalLink className="w-3 h-3" /> Open
            </button>
            {/* DOWNLOAD button — uses proxy URL, saves as .pdf */}
            <button
              onClick={() => downloadResume(url, studentName)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-bauhaus-yellow text-bauhaus-black text-xs font-black border-2 border-bauhaus-yellow hover:opacity-90 transition uppercase tracking-wider"
            >
              <Download className="w-3 h-3" /> Download PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center bg-bauhaus-red hover:opacity-80 transition text-white font-black text-lg border-2 border-bauhaus-red"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF iframe — uses proxy URL for correct Content-Type */}
        <div className="flex-1 bg-[#f5f5f0]">
          {!useFallback ? (
            <iframe
              src={`${proxyUrl}#toolbar=1&navpanes=0`}
              title="Resume PDF"
              className="w-full h-full border-none"
              onError={() => setUseFallback(true)}
            />
          ) : (
            /* Fallback: Google Docs viewer */
            <iframe
              src={googleDocsUrl}
              title="Resume PDF (Google Viewer)"
              className="w-full h-full border-none"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeViewer;
