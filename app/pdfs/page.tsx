'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Upload, X, Check, CheckCircle2 } from 'lucide-react';
import Button from '@/components/Button';
import { getPDFs, savePDF, deletePDF } from '@/lib/storage';
import { PDF } from '@/types';
import toast from 'react-hot-toast';

export default function PDFsPage() {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPDFs();
  }, []);

  const loadPDFs = async () => {
    try {
      const loadedPDFs = await getPDFs();
      setPdfs(loadedPDFs);
    } catch (error) {
      toast.error('Failed to load PDFs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name} is not a PDF file`);
        continue;
      }

      const pdf: PDF = {
        id: crypto.randomUUID(),
        name: file.name,
        file,
        uploadedAt: new Date(),
        versions: {
          '2-members': false,
          'all-members': false,
        },
        size: file.size,
        type: 'application/pdf',
      };

      try {
        await savePDF(pdf);
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
        console.error(error);
      }
    }

    loadPDFs();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    e.target.value = ''; // Reset input
  };

  const toggleVersion = async (pdfId: string, version: '2-members' | 'all-members') => {
    const pdf = pdfs.find(p => p.id === pdfId);
    if (!pdf) return;

    const updatedPDF = {
      ...pdf,
      versions: {
        ...pdf.versions,
        [version]: !pdf.versions[version],
      },
    };

    try {
      await savePDF(updatedPDF);
      toast.success('PDF updated');
      loadPDFs();
    } catch (error) {
      toast.error('Failed to update PDF');
      console.error(error);
    }
  };

  const handleDelete = async (pdfId: string) => {
    if (!confirm('Are you sure you want to delete this PDF?')) return;

    try {
      await deletePDF(pdfId);
      toast.success('PDF deleted');
      loadPDFs();
    } catch (error) {
      toast.error('Failed to delete PDF');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading PDFs...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage PDFs</h1>
          <p className="text-gray-600">Upload and configure your invitation PDFs</p>
        </header>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-8 border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 bg-white hover:border-primary-400'
          }`}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700 mb-2">
            Drag and drop PDFs here, or
          </p>
          <label className="inline-block">
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
            <Button variant="primary">
              Choose Files
            </Button>
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Upload your invitation PDF files
          </p>
        </div>

        {/* PDF List */}
        {pdfs.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No PDFs uploaded yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Upload your first PDF to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pdfs.map((pdf) => (
              <div
                key={pdf.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-8 h-8 text-primary-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {pdf.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {(pdf.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    {/* Version Toggles */}
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => toggleVersion(pdf.id, '2-members')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                          pdf.versions['2-members']
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-300 bg-white text-gray-600 hover:border-primary-400'
                        }`}
                      >
                        {pdf.versions['2-members'] ? (
                          <CheckCircle2 className="w-5 h-5 text-primary-600" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-400 rounded" />
                        )}
                        <span className="font-medium">2 Members</span>
                      </button>

                      <button
                        onClick={() => toggleVersion(pdf.id, 'all-members')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                          pdf.versions['all-members']
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-300 bg-white text-gray-600 hover:border-primary-400'
                        }`}
                      >
                        {pdf.versions['all-members'] ? (
                          <CheckCircle2 className="w-5 h-5 text-primary-600" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-400 rounded" />
                        )}
                        <span className="font-medium">All Members</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(pdf.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Delete PDF"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

