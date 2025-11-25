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
  return new Promise(async (resolve, reject) => {
    try {
      // Convert File to ArrayBuffer for IndexedDB storage
      let fileData: ArrayBuffer | null = null;
      if (pdf.file instanceof File || pdf.file instanceof Blob) {
        fileData = await pdf.file.arrayBuffer();
      } else if (pdf.file instanceof ArrayBuffer) {
        fileData = pdf.file;
      }

      // Prepare PDF data for storage
      const pdfData = {
        ...pdf,
        file: fileData, // Store as ArrayBuffer
        uploadedAt: pdf.uploadedAt instanceof Date ? pdf.uploadedAt.toISOString() : pdf.uploadedAt,
      };

      const transaction = database.transaction([STORES.PDFS], 'readwrite');
      const store = transaction.objectStore(STORES.PDFS);
      const request = store.put(pdfData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    } catch (error) {
      reject(error);
    }
  });
}

export async function getPDFs(): Promise<any[]> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.PDFS], 'readonly');
    const store = transaction.objectStore(STORES.PDFS);
    const request = store.getAll();
    request.onsuccess = () => {
      const pdfs = (request.result || []).map((pdf: any) => {
        // Convert ArrayBuffer back to Blob for use
        if (pdf.file instanceof ArrayBuffer) {
          pdf.file = new Blob([pdf.file], { type: 'application/pdf' });
        }
        // Convert ISO string back to Date
        if (typeof pdf.uploadedAt === 'string') {
          pdf.uploadedAt = new Date(pdf.uploadedAt);
        }
        return pdf;
      });
      resolve(pdfs);
    };
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
    contacts.forEach(contact => {
      // Ensure dates are serialized properly
      const contactData = {
        ...contact,
        lastSent: contact.lastSent instanceof Date ? contact.lastSent.toISOString() : contact.lastSent,
      };
      store.put(contactData);
    });
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
    request.onsuccess = () => {
      const contacts = (request.result || []).map((contact: any) => {
        // Convert ISO string back to Date
        if (contact.lastSent && typeof contact.lastSent === 'string') {
          contact.lastSent = new Date(contact.lastSent);
        }
        return contact;
      });
      resolve(contacts);
    };
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
    // Ensure dates are serialized
    const assignmentData = {
      ...assignment,
      assignedAt: assignment.assignedAt instanceof Date ? assignment.assignedAt.toISOString() : assignment.assignedAt,
    };
    const request = store.put(assignmentData);
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
    request.onsuccess = () => {
      const assignments = (request.result || []).map((assignment: any) => {
        // Convert ISO string back to Date
        if (assignment.assignedAt && typeof assignment.assignedAt === 'string') {
          assignment.assignedAt = new Date(assignment.assignedAt);
        }
        return assignment;
      });
      resolve(assignments);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getAssignmentByContactId(contactId: string): Promise<any | null> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORES.ASSIGNMENTS], 'readonly');
    const store = transaction.objectStore(STORES.ASSIGNMENTS);
    const request = store.get(contactId);
    request.onsuccess = () => {
      const assignment = request.result;
      if (assignment && assignment.assignedAt && typeof assignment.assignedAt === 'string') {
        assignment.assignedAt = new Date(assignment.assignedAt);
      }
      resolve(assignment || null);
    };
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
          contact.lastSent = new Date().toISOString();
        }
        if (errorMessage) {
          contact.errorMessage = errorMessage;
        }
        // Ensure dates are serialized
        const contactData = {
          ...contact,
          lastSent: contact.lastSent instanceof Date ? contact.lastSent.toISOString() : contact.lastSent,
        };
        const putRequest = store.put(contactData);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        reject(new Error('Contact not found'));
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

