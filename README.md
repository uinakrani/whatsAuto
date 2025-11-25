# WhatsAuto - WhatsApp Invitation Automation PWA

A Progressive Web App (PWA) for automating WhatsApp invitation sending with PDF attachments. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 📄 **PDF Management**: Upload and organize invitation PDFs with 2-members/all-members versions
- 👥 **Contact Management**: Import contacts from device or CSV file
- 📱 **Mobile-First**: Optimized for mobile devices with native app-like experience
- 🔄 **Automation**: Smart automation with minimal user interaction (2-3 taps)
- 🛡️ **Safe**: Built-in rate limiting to prevent WhatsApp account restrictions
- 💾 **Offline Support**: Works offline with Service Worker caching
- 🎨 **Beautiful UI**: Modern, seamless UI/UX with smooth animations

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Smooth animations
- **next-pwa** - PWA support
- **libphonenumber-js** - Phone number validation
- **react-hot-toast** - Toast notifications

## Project Structure

```
whatsAuto/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   ├── pdfs/           # PDF management
│   ├── contacts/       # Contact management
│   ├── assign/         # PDF assignment
│   └── automate/       # Automation dashboard
├── components/          # React components
├── lib/                # Utilities and helpers
├── public/             # Static assets
└── types/              # TypeScript types
```

## License

MIT

