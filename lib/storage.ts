// IndexedDB storage utilities for contacts, PDFs, and assignments

const DB_NAME = 'whatsauto-db';
const DB_VERSION = 1;

const STORES = {
  PDFS: 'pdfs',
  CONTACTS: 'contacts',
  ASSIGNMENTS: 'assignments',
} as const;

let db: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create PDFs store
      if (!database.objectStoreNames.contains(STORES.PDFS)) {
        const pdfStore = database.createObjectStore(STORES.PDFS, { keyPath: 'id' });
        pdfStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
      }

      // Create Contacts store
      if (!database.objectStoreNames.contains(STORES.CONTACTS)) {
        const contactStore = database.createObjectStore(STORES.CONTACTS, { keyPath: 'id' });
        contactStore.createIndex('phone', 'phone', { unique: false });
        contactStore.createIndex('status', 'status', { unique: false });
      }

      // Create Assignments store
      if (!database.objectStoreNames.contains(STORES.ASSIGNMENTS)) {
        const assignmentStore = database.createObjectStore(STORES.ASSIGNMENTS, { keyPath: 'contactId' });
        assignmentStore.createIndex('pdfId', 'pdfId', { unique: false });
      }
    };
  });
}

// PDF operations
export async function savePDF(pdf: any): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PDFS], 'readwrite');
    const store = transaction.objectStore(STORES.PDFS);
    const request = store.put(pdf);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getPDFs(): Promise<any[]> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PDFS], 'readonly');
    const store = transaction.objectStore(STORES.PDFS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function deletePDF(id: string): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PDFS], 'readwrite');
    const store = transaction.objectStore(STORES.PDFS);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Contact operations
export async function saveContact(contact: any): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CONTACTS], 'readwrite');
    const store = transaction.objectStore(STORES.CONTACTS);
    const request = store.put(contact);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function saveContacts(contacts: any[]): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CONTACTS], 'readwrite');
    const store = transaction.objectStore(STORES.CONTACTS);
    contacts.forEach(contact => store.put(contact));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getContacts(): Promise<any[]> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CONTACTS], 'readonly');
    const store = transaction.objectStore(STORES.CONTACTS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteContact(id: string): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CONTACTS], 'readwrite');
    const store = transaction.objectStore(STORES.CONTACTS);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Assignment operations
export async function saveAssignment(assignment: any): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.ASSIGNMENTS], 'readwrite');
    const store = transaction.objectStore(STORES.ASSIGNMENTS);
    const request = store.put(assignment);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAssignments(): Promise<any[]> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.ASSIGNMENTS], 'readonly');
    const store = transaction.objectStore(STORES.ASSIGNMENTS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function updateContactStatus(contactId: string, status: 'pending' | 'assigned' | 'sent' | 'failed', errorMessage?: string): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.CONTACTS], 'readwrite');
    const store = transaction.objectStore(STORES.CONTACTS);
    const getRequest = store.get(contactId);
    
    getRequest.onsuccess = () => {
      const contact = getRequest.result;
      if (contact) {
        contact.status = status;
        if (status === 'sent') {
          contact.lastSent = new Date();
        }
        if (errorMessage) {
          contact.errorMessage = errorMessage;
        }
        const putRequest = store.put(contact);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        reject(new Error('Contact not found'));
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

