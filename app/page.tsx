import Link from "next/link";
import { Phone, FileText, Send, Users } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-4">
              WhatsAuto
            </h1>
            <p className="text-lg text-primary-700">
              Automate WhatsApp invitation sending with ease
            </p>
          </header>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Link
              href="/pdfs"
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Manage PDFs
                </h2>
              </div>
              <p className="text-gray-600">
                Upload and organize your invitation PDFs. Mark them for 2 members or all members.
              </p>
            </Link>

            <Link
              href="/contacts"
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Manage Contacts
                </h2>
              </div>
              <p className="text-gray-600">
                Import contacts from your device or file. Organize and select contacts for sending.
              </p>
            </Link>

            <Link
              href="/assign"
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Assign PDFs
                </h2>
              </div>
              <p className="text-gray-600">
                Assign the right PDF to each contact. Choose 2 members or all members version.
              </p>
            </Link>

            <Link
              href="/automate"
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Send className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Automate Sending
                </h2>
              </div>
              <p className="text-gray-600">
                Start automation with just 2-3 taps. System handles the rest safely and automatically.
              </p>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Quick Start
            </h3>
            <ol className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </span>
                <span>Upload your invitation PDFs and mark them for 2 members or all members</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </span>
                <span>Import contacts from your device or upload a CSV file</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </span>
                <span>Select contacts and assign the appropriate PDF to each</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </span>
                <span>Start automation - just 2-3 taps and the system handles the rest!</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}

