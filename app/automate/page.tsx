'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/Button';
import { getContacts, getAssignments, getPDFs, updateContactStatus } from '@/lib/storage';
import { openWhatsAppForContact, shareViaWhatsApp, isMobileDevice, getDelayBetweenMessages } from '@/lib/whatsapp';
import { Contact, PDF, Assignment } from '@/types';
import toast from 'react-hot-toast';

export default function AutomatePage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    pending: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);
  const automationQueueRef = useRef<Array<{ contact: Contact; assignment: Assignment; pdf: PDF | null }>>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loadedContacts, loadedAssignments, loadedPDFs] = await Promise.all([
        getContacts(),
        getAssignments(),
        getPDFs(),
      ]);
      setContacts(loadedContacts);
      setAssignments(loadedAssignments);
      setPdfs(loadedPDFs);

      // Build automation queue with contacts that have assignments
      const queue: Array<{ contact: Contact; assignment: Assignment; pdf: PDF | null }> = [];
      
      for (const assignment of loadedAssignments) {
        const contact = loadedContacts.find(c => c.id === assignment.contactId);
        if (contact && (contact.status === 'pending' || contact.status === 'assigned')) {
          const pdf = loadedPDFs.find(p => p.id === assignment.pdfId) || null;
          queue.push({ contact, assignment, pdf });
        }
      }

      automationQueueRef.current = queue;
      setCurrentIndex(0);

      const assignedContacts = loadedContacts.filter((c) =>
        loadedAssignments.some((a) => a.contactId === c.id)
      );

      updateStats(loadedContacts, loadedAssignments);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (loadedContacts: Contact[], loadedAssignments: Assignment[]) => {
    const assignedContacts = loadedContacts.filter((c) =>
      loadedAssignments.some((a) => a.contactId === c.id)
    );

    setStats({
      total: assignedContacts.length,
      sent: assignedContacts.filter((c) => c.status === 'sent').length,
      pending: assignedContacts.filter((c) => c.status === 'pending' || c.status === 'assigned').length,
      failed: assignedContacts.filter((c) => c.status === 'failed').length,
    });
  };

  const processNextContact = async () => {
    if (currentIndex >= automationQueueRef.current.length) {
      // All contacts processed
      isRunningRef.current = false;
      setIsRunning(false);
      setCurrentContact(null);
      toast.success('All contacts processed!');
      await loadData(); // Refresh stats
      return;
    }

    const item = automationQueueRef.current[currentIndex];
    if (!item) {
      isRunningRef.current = false;
      setIsRunning(false);
      return;
    }

    setCurrentContact(item.contact);

    try {
      // Open WhatsApp for this contact
      if (isMobileDevice()) {
        const shared = await shareViaWhatsApp(item.contact, item.pdf, item.assignment.version);
        if (!shared) {
          // Fallback to opening URL
          await openWhatsAppForContact(item.contact, item.pdf, item.assignment.version);
        }
      } else {
        await openWhatsAppForContact(item.contact, item.pdf, item.assignment.version);
      }

      toast.success(
        `Opened WhatsApp for ${item.contact.name}. Please send the message, then click "Mark as Sent" or "Skip".`,
        { duration: 5000 }
      );
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      await updateContactStatus(item.contact.id, 'failed', 'Failed to open WhatsApp');
      toast.error(`Failed to open WhatsApp for ${item.contact.name}`);
      
      // Move to next after delay
      const delay = getDelayBetweenMessages();
      timeoutRef.current = setTimeout(() => {
        if (isRunningRef.current) {
          setCurrentIndex(prev => prev + 1);
          processNextContact();
        }
      }, delay);
    }
  };

  const handleStart = async () => {
    if (stats.total === 0) {
      toast.error('No contacts assigned. Please assign PDFs to contacts first.');
      return;
    }

    if (automationQueueRef.current.length === 0) {
      toast.error('No pending contacts to process.');
      return;
    }

    isRunningRef.current = true;
    setIsRunning(true);
    setCurrentIndex(0);
    toast.success('Automation started! Follow the prompts to send messages.');
    await processNextContact();
  };

  const handlePause = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isRunningRef.current = false;
    setIsRunning(false);
    toast.info('Automation paused');
  };

  const handleMarkAsSent = async () => {
    if (!currentContact) return;

    try {
      await updateContactStatus(currentContact.id, 'sent');
      toast.success(`Marked ${currentContact.name} as sent`);
      
      // Move to next contact after delay
      const delay = getDelayBetweenMessages();
      setCurrentIndex(prev => prev + 1);
      
      timeoutRef.current = setTimeout(() => {
        if (isRunningRef.current) {
          processNextContact();
        }
      }, delay);
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  const handleSkip = async () => {
    if (!currentContact) return;

    // Move to next contact
    const delay = getDelayBetweenMessages();
    setCurrentIndex(prev => prev + 1);
    
    timeoutRef.current = setTimeout(() => {
      if (isRunningRef.current) {
        processNextContact();
      }
    }, delay);
  };

  const handleMarkAsFailed = async () => {
    if (!currentContact) return;

    try {
      await updateContactStatus(currentContact.id, 'failed', 'Marked as failed by user');
      toast.info(`Marked ${currentContact.name} as failed`);
      
      // Move to next contact after delay
      const delay = getDelayBetweenMessages();
      setCurrentIndex(prev => prev + 1);
      
      timeoutRef.current = setTimeout(() => {
        if (isRunningRef.current) {
          processNextContact();
        }
      }, delay);
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

  const progressPercentage = stats.total > 0 ? ((stats.sent + stats.failed) / stats.total) * 100 : 0;
  const remainingContacts = automationQueueRef.current.length - currentIndex;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto p-4">
        <Link href="/" className="inline-flex items-center gap-2 text-primary-600 mb-6">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Automation Dashboard</h1>
          <p className="text-gray-600">Monitor and control your WhatsApp automation</p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
            <p className="text-sm text-gray-600">Sent</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            <p className="text-sm text-gray-600">Failed</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Progress</h3>
            <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-primary-600 h-full transition-all duration-300 rounded-full flex items-center justify-center"
              style={{ width: `${progressPercentage}%` }}
            >
              {progressPercentage > 10 && (
                <span className="text-xs text-white font-medium">
                  {stats.sent}/{stats.total}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Current Contact Card */}
        {isRunning && currentContact && (
          <div className="bg-primary-50 border-2 border-primary-500 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-primary-900 mb-4">Current Contact</h3>
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="text-lg font-semibold text-gray-900">{currentContact.name}</p>
              <p className="text-sm text-gray-600">{currentContact.phoneFormatted}</p>
              <p className="text-xs text-gray-500 mt-2">
                WhatsApp should be open in a new tab. Send the PDF, then mark as sent below.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleMarkAsSent}
                variant="primary"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Mark as Sent
              </Button>
              <Button
                onClick={handleSkip}
                variant="outline"
                className="flex-1"
              >
                Skip
              </Button>
              <Button
                onClick={handleMarkAsFailed}
                variant="ghost"
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>
            {remainingContacts > 0 && (
              <p className="text-sm text-primary-700 mt-3 text-center">
                {remainingContacts} contact(s) remaining
              </p>
            )}
          </div>
        )}

        {/* Control Panel */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Controls</h3>
          <div className="flex gap-4">
            {!isRunning ? (
              <Button
                onClick={handleStart}
                variant="primary"
                className="flex-1 flex items-center justify-center gap-2"
                disabled={stats.total === 0 || automationQueueRef.current.length === 0}
              >
                <Play className="w-5 h-5" />
                Start Automation
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                variant="secondary"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Pause className="w-5 h-5" />
                Pause
              </Button>
            )}
          </div>
          {stats.total === 0 && (
            <p className="text-sm text-amber-600 mt-3">
              No contacts assigned. Please assign PDFs to contacts first.
            </p>
          )}
          {automationQueueRef.current.length === 0 && stats.total > 0 && (
            <p className="text-sm text-green-600 mt-3">
              All contacts have been processed!
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">How it works</h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-semibold">1.</span>
              <span>Click "Start Automation" to begin</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">2.</span>
              <span>A new tab will open with WhatsApp Web for the first contact</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">3.</span>
              <span>In WhatsApp Web: search for the contact, attach the PDF, and send</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">4.</span>
              <span>Come back to this app and click "Mark as Sent" to continue</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">5.</span>
              <span>The next contact will open automatically after a delay (60-120 seconds)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">6.</span>
              <span>You can pause at any time or skip contacts if needed</span>
            </li>
          </ol>
        </div>

        {/* Safety Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
          <p className="text-sm text-amber-800">
            <strong>Safety:</strong> The system uses conservative rate limiting (60-120 seconds between messages, max 30-50 per day) to protect your WhatsApp account.
          </p>
        </div>
      </div>
    </main>
  );
}

