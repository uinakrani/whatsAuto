export interface PDF {
  id: string;
  name: string;
  file: File | Blob;
  thumbnail?: string;
  uploadedAt: Date;
  versions: {
    '2-members': boolean;
    'all-members': boolean;
  };
  size: number;
  type: 'application/pdf';
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  phoneFormatted: string;
  isSaved: boolean;
  countryCode?: string;
  status: 'pending' | 'assigned' | 'sent' | 'failed';
  assignment?: {
    pdfId: string;
    version: '2-members' | 'all-members';
  };
  lastSent?: Date;
  errorMessage?: string;
  searchMethod: 'name' | 'phone';
}

export interface Assignment {
  contactId: string;
  pdfId: string;
  version: '2-members' | 'all-members';
  assignedAt: Date;
}

