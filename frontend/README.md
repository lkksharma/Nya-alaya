# Nya-Alaya (न्याय आलय) - Court Scheduling System Frontend

A modern, aesthetically pleasing React-based frontend for the court scheduling system with government-inspired design.

## Features

- **Dashboard**: Overview of all schedules, cases, and statistics
- **Case Management**: Add, view, edit, and delete cases
- **Judge Management**: Manage judges and view their individual schedules
- **Lawyer Management**: Manage lawyers and track their cases
- **Beautiful UI**: Government of India inspired color scheme with smooth animations
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- React 18 with Vite
- React Router for navigation
- Framer Motion for animations
- Axios for API calls
- Lucide React for icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Django backend running on http://127.0.0.1:8000

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   │   └── Layout.jsx  # Main layout with navigation
│   ├── pages/          # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Cases.jsx
│   │   ├── Judges.jsx
│   │   └── Lawyers.jsx
│   ├── services/       # API service layer
│   │   └── api.js
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
└── package.json
```

## Design Philosophy

The design is inspired by the Government of India's digital platforms:

- **Colors**:
  - Primary Blue (#1a4d8f): Authority and trust
  - Saffron (#ff9933): Energy and courage
  - Green (#138808): Growth and prosperity
  - Gold (#d4af37): Excellence and prestige

- **Typography**: Clean, professional sans-serif fonts
- **Animations**: Smooth, professional transitions using Framer Motion
- **Icons**: Lucide React for consistent, clean iconography

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Integration

The frontend connects to the Django backend API running on `http://127.0.0.1:8000/api/`

Endpoints:
- `/api/cases/` - Case management
- `/api/judges/` - Judge management
- `/api/lawyers/` - Lawyer management
- `/api/schedules/` - Schedule management

## Features in Detail

### Dashboard
- Real-time statistics
- Recent schedules overview
- Pending cases list
- Quick refresh functionality

### Case Management
- Create new cases with detailed information
- Filter by case type
- Search functionality
- View scheduled dates
- Edit and delete cases

### Judge Management
- Add new judges
- View judge-specific schedules
- Track case assignments
- Manage judge availability

### Lawyer Management
- Register lawyers
- Track active cases per lawyer
- View case assignments

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

© 2025 Nya-Alaya
