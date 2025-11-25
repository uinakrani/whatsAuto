'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, FileText, Users } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/Button';
import { getContacts, getPDFs, saveAssignment } from '@/lib/storage';
import { Contact, PDF, Assignment } from '@/types';
import toast from 'react-hot-toast';

export default function AssignPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [assignments, setAssignments] = useState<Map<string, { pdfId: string; version: '2-members' | 'all-members' }>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loadedContacts, loadedPDFs] = await Promise.all([
        getContacts(),
        getPDFs(),
      ]);
      setContacts(loadedContacts);
      setPdfs(loadedPDFs);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleContactSelection = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const assignPDF = (contactId: string, pdfId: string, version: '2-members' | 'all-members') => {
    const newAssignments = new Map(assignments);
    newAssignments.set(contactId, { pdfId, version });
    setAssignments(newAssignments);
  };

  const saveAllAssignments = async () => {
    if (assignments.size === 0) {
      toast.error('No assignments to save');
      return;
    }

    try {
      for (const [contactId, assignment] of assignments.entries()) {
        const assignmentData: Assignment = {
          contactId,
          pdfId: assignment.pdfId,
          version: assignment.version,
          assignedAt: new Date(),
        };
        await saveAssignment(assignmentData);
      }
      toast.success(`Saved ${assignments.size} assignment(s)`);
    } catch (error) {
      toast.error('Failed to save assignments');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-primary-600 mb-6">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <div className="bg-white rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No contacts available</p>
            <p className="text-gray-500 text-sm mb-6">Import contacts first to assign PDFs</p>
            <Link href="/contacts">
              <Button variant="primary">Go to Contacts</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (pdfs.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-primary-600 mb-6">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <div className="bg-white rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No PDFs available</p>
            <p className="text-gray-500 text-sm mb-6">Upload PDFs first to assign them</p>
            <Link href="/pdfs">
              <Button variant="primary">Go to PDFs</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto p-4">
        <Link href="/" className="inline-flex items-center gap-2 text-primary-600 mb-6">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assign PDFs to Contacts</h1>
          <p className="text-gray-600">Select contacts and assign the appropriate PDF version</p>
        </header>

        {/* Selected Contacts Summary */}
        {selectedContacts.size > 0 && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-primary-900">
              {selectedContacts.size} contact(s) selected
            </p>
          </div>
        )}

        {/* Contact List */}
        <div className="space-y-3 mb-8">
          {contacts.map((contact) => {
            const isSelected = selectedContacts.has(contact.id);
            const assignment = assignments.get(contact.id);
            const assignedPDF = assignment ? pdfs.find((p) => p.id === assignment.pdfId) : null;

            return (
              <div
                key={contact.id}
                className={`bg-white rounded-xl p-4 shadow-sm ${
                  isSelected ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleContactSelection(contact.id)}
                    className="flex-shrink-0 mt-1"
                  >
                    {isSelected ? (
                      <CheckCircle2 className="w-6 h-6 text-primary-600" />
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                    )}
                  </button>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{contact.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{contact.phoneFormatted}</p>

                    {isSelected && (
                      <div className="space-y-3">
                        {/* PDF Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select PDF
                          </label>
                          <select
                            value={assignment?.pdfId || ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                assignPDF(contact.id, e.target.value, assignment?.version || '2-members');
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="">Choose a PDF...</option>
                            {pdfs.map((pdf) => (
                              <option key={pdf.id} value={pdf.id}>
                                {pdf.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Version Selection */}
                        {assignment?.pdfId && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select Version
                            </label>
                            <div className="flex gap-3">
                              <button
                                onClick={() => assignPDF(contact.id, assignment.pdfId, '2-members')}
                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                                  assignment.version === '2-members'
                                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                                    : 'border-gray-300 bg-white text-gray-600'
                                }`}
                              >
                                2 Members
                              </button>
                              <button
                                onClick={() => assignPDF(contact.id, assignment.pdfId, 'all-members')}
                                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                                  assignment.version === 'all-members'
                                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                                    : 'border-gray-300 bg-white text-gray-600'
                                }`}
                              >
                                All Members
                              </button>
                            </div>
                          </div>
                        )}

                        {assignedPDF && assignment && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm text-green-800">
                              ✓ Assigned: <strong>{assignedPDF.name}</strong> ({assignment.version})
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Save Button */}
        {assignments.size > 0 && (
          <div className="fixed bottom-4 left-0 right-0 px-4">
            <div className="max-w-4xl mx-auto">
              <Button
                onClick={saveAllAssignments}
                variant="primary"
                className="w-full"
                size="lg"
              >
                Save {assignments.size} Assignment(s)
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

