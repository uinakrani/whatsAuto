'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Upload, Search, UserPlus, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '@/components/Button';
import { getContacts, saveContacts, deleteContact } from '@/lib/storage';
import { Contact } from '@/types';
import { formatPhoneNumber, formatPhoneDisplay } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredContacts(
        contacts.filter(
          (contact) =>
            contact.name.toLowerCase().includes(query) ||
            contact.phone.includes(query) ||
            contact.phoneFormatted.includes(query)
        )
      );
    }
  }, [searchQuery, contacts]);

  const loadContacts = async () => {
    try {
      const loadedContacts = await getContacts();
      setContacts(loadedContacts);
      setFilteredContacts(loadedContacts);
    } catch (error) {
      toast.error('Failed to load contacts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const importFromDevice = async () => {
    try {
      // Check if Contact Picker API is available
      if ('contacts' in navigator && 'ContactsManager' in window) {
        const contactsManager = (navigator as any).contacts;
        const contacts = await contactsManager.select(['name', 'tel'], {
          multiple: true,
        });

        if (contacts && contacts.length > 0) {
          await processImportedContacts(contacts);
        }
      } else {
        // Fallback: Use file input or show instructions
        toast.error('Contact Picker API not supported. Please use file import.');
        document.getElementById('file-import')?.click();
      }
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        toast.error('Permission denied. Please allow contact access.');
      } else {
        toast.error('Failed to import contacts from device');
        console.error(error);
      }
    }
  };

  const processImportedContacts = async (deviceContacts: any[]) => {
    const newContacts: Contact[] = [];

    for (const deviceContact of deviceContacts) {
      const name = deviceContact.name?.[0] || 'Unknown';
      const phoneNumbers = deviceContact.tel || [];

      for (const phone of phoneNumbers) {
        const phoneNumber = formatPhoneNumber(phone);
        const contactId = crypto.randomUUID();

        const contact: Contact = {
          id: contactId,
          name,
          phone: phoneNumber,
          phoneFormatted: formatPhoneDisplay(phoneNumber),
          isSaved: true, // Imported from device, so it's saved
          status: 'pending',
          searchMethod: 'name',
        };

        newContacts.push(contact);
      }
    }

    if (newContacts.length > 0) {
      try {
        await saveContacts(newContacts);
        toast.success(`Imported ${newContacts.length} contact(s)`);
        loadContacts();
      } catch (error) {
        toast.error('Failed to save imported contacts');
        console.error(error);
      }
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simple CSV parser (name,phone format)
    const text = await file.text();
    const lines = text.split('\n').filter((line) => line.trim());

    const newContacts: Contact[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Skip header row
      const [name, phone] = lines[i].split(',').map((s) => s.trim().replace(/"/g, ''));

      if (name && phone) {
        const phoneNumber = formatPhoneNumber(phone);
        const contactId = crypto.randomUUID();

        const contact: Contact = {
          id: contactId,
          name,
          phone: phoneNumber,
          phoneFormatted: formatPhoneDisplay(phoneNumber),
          isSaved: false, // From file, assume not saved
          status: 'pending',
          searchMethod: 'phone',
        };

        newContacts.push(contact);
      }
    }

    if (newContacts.length > 0) {
      try {
        await saveContacts(newContacts);
        toast.success(`Imported ${newContacts.length} contact(s) from file`);
        loadContacts();
      } catch (error) {
        toast.error('Failed to import contacts from file');
        console.error(error);
      }
    }

    e.target.value = '';
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      await deleteContact(contactId);
      toast.success('Contact deleted');
      loadContacts();
    } catch (error) {
      toast.error('Failed to delete contact');
      console.error(error);
    }
  };

  const toggleSelection = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const selectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map((c) => c.id)));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto p-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Contacts</h1>
          <p className="text-gray-600">Import and organize your contacts</p>
        </header>

        {/* Import Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button
            onClick={importFromDevice}
            variant="primary"
            className="w-full flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Import from Device
          </Button>

          <label className="w-full inline-block">
            <input
              id="file-import"
              type="file"
              accept=".csv,.txt"
              onChange={handleFileImport}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Import from File
            </Button>
          </label>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Selection Actions */}
        {contacts.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedContacts.size} of {filteredContacts.length} selected
            </p>
            <Button
              onClick={selectAll}
              variant="ghost"
              size="sm"
            >
              {selectedContacts.size === filteredContacts.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        )}

        {/* Contact List */}
        {filteredContacts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No contacts found</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchQuery ? 'Try a different search term' : 'Import contacts to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all ${
                  selectedContacts.has(contact.id) ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleSelection(contact.id)}
                    className="flex-shrink-0"
                  >
                    {selectedContacts.has(contact.id) ? (
                      <CheckCircle2 className="w-6 h-6 text-primary-600" />
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {contact.name}
                      </h3>
                      {contact.isSaved ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{contact.phoneFormatted}</p>
                    {!contact.isSaved && (
                      <p className="text-xs text-amber-600 mt-1">
                        Will search by phone number
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Delete contact"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {contacts.length > 0 && (
          <div className="mt-8 bg-white rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
                <p className="text-sm text-gray-600">Total Contacts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {contacts.filter((c) => c.isSaved).length}
                </p>
                <p className="text-sm text-gray-600">Saved in Device</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

