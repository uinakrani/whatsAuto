'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, CheckCircle2, Clock, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/Button';
import { getContacts, getAssignments } from '@/lib/storage';
import toast from 'react-hot-toast';

export default function AutomatePage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    pending: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loadedContacts, loadedAssignments] = await Promise.all([
        getContacts(),
        getAssignments(),
      ]);
      setContacts(loadedContacts);
      setAssignments(loadedAssignments);

      const assignedContacts = loadedContacts.filter((c) =>
        loadedAssignments.some((a) => a.contactId === c.id)
      );

      setStats({
        total: assignedContacts.length,
        sent: assignedContacts.filter((c) => c.status === 'sent').length,
        pending: assignedContacts.filter((c) => c.status === 'pending' || c.status === 'assigned').length,
        failed: assignedContacts.filter((c) => c.status === 'failed').length,
      });
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (stats.total === 0) {
      toast.error('No contacts assigned. Please assign PDFs to contacts first.');
      return;
    }

    setIsRunning(true);
    toast.success('Automation started! This is a demo - full automation will be implemented.');
    // TODO: Implement actual automation logic
  };

  const handlePause = () => {
    setIsRunning(false);
    toast.info('Automation paused');
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

  const progressPercentage = stats.total > 0 ? (stats.sent / stats.total) * 100 : 0;

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

        {/* Control Panel */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Controls</h3>
          <div className="flex gap-4">
            {!isRunning ? (
              <Button
                onClick={handleStart}
                variant="primary"
                className="flex-1 flex items-center justify-center gap-2"
                disabled={stats.total === 0}
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
              <span>Perform 2-3 manual sends to train the system</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">3.</span>
              <span>The system will learn the pattern and continue automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">4.</span>
              <span>Monitor progress in real-time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold">5.</span>
              <span>You can pause/resume at any time</span>
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

