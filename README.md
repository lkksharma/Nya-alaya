# Nya-Alaya (न्याय आलय) - Court Scheduling System

A comprehensive court scheduling system with AI-powered planning and a beautiful React frontend.

## Deployed at: http://ec2-16-171-154-218.eu-north-1.compute.amazonaws.com/

## Project Structure

```
court_agent/
├── court_agent/        # Django project settings
├── scheduler/          # Main Django app
│   ├── models.py      # Database models
│   ├── views.py       # API views
│   ├── urls.py        # URL routing
│   ├── serializers.py # DRF serializers
│   ├── tools/         # Scheduling tools
│   ├── agent/         # AI planning agents
│   └── management/    # Django commands
├── frontend/          # React frontend
└── db.sqlite3        # SQLite database
```

## Quick Start

### Backend (Django)

1. **Install Dependencies**:
```bash
pip install django djangorestframework django-cors-headers
```

2. **Run Migrations**:
```bash
python manage.py makemigrations
python manage.py migrate
```

3. **Create Superuser** (optional):
```bash
python manage.py createsuperuser
```

4. **Start Django Server**:
```bash
python manage.py runserver
```

Backend will be available at: http://127.0.0.1:8000

### Frontend (React)

1. **Navigate to Frontend**:
```bash
cd frontend
```

2. **Install Dependencies**:
```bash
npm install
```

3. **Start Development Server**:
```bash
npm run dev
```

Frontend will be available at: http://localhost:5173

## Features

### Backend Features
- **RESTful API** with Django REST Framework
- **Case Management**: Track and manage court cases
- **Judge Management**: Manage judges and their availability
- **Lawyer Management**: Track lawyers and their cases
- **Schedule Management**: Automated scheduling system
- **AI Planning Agent**: Hybrid planner using OR-Tools and OpenAI
- **CORS Enabled**: Ready for frontend integration

### Frontend Features
- **Modern React UI** with Vite
- **Government-Inspired Design**: Colors and aesthetics from GOI digital platforms
- **Smooth Animations**: Framer Motion for professional transitions
- **Responsive Design**: Works on all devices
- **Real-time Dashboard**: Live statistics and updates
- **Interactive Forms**: Easy case, judge, and lawyer management
- **Schedule Viewing**: Individual schedules for judges and lawyers

## API Endpoints

- `GET /api/health/` - Health check
- `GET /api/cases/` - List all cases
- `POST /api/cases/` - Create new case
- `GET /api/cases/{id}/` - Get case details
- `PUT /api/cases/{id}/` - Update case
- `DELETE /api/cases/{id}/` - Delete case
- Similar endpoints for `/judges/`, `/lawyers/`, and `/schedules/`

## Usage

### Adding a Case
1. Navigate to "Cases" page
2. Click "Add New Case"
3. Fill in the form:
   - Case Number
   - Case Type (Civil/Criminal/Family/Other)
   - Filed Date
   - Urgency (0-100%)
   - Estimated Duration

### Managing Judges
1. Navigate to "Judges" page
2. Add judges with name and court
3. View individual judge schedules
4. Track case assignments

### Managing Lawyers
1. Navigate to "Lawyers" page
2. Register lawyers
3. View their active cases
4. Track case load

## Technologies Used

### Backend
- Python 3.13
- Django 5.1.6
- Django REST Framework
- django-cors-headers
- OR-Tools (for optimization)
- OpenAI API (for AI planning)

### Frontend
- React 18
- Vite
- React Router DOM
- Framer Motion
- Axios
- Lucide React Icons

## Design System

### Colors
- **Primary Blue**: #1a4d8f (Authority)
- **Saffron**: #ff9933 (Energy)
- **Green**: #138808 (Growth)
- **Gold**: #d4af37 (Excellence)

### Typography
- Font Family: Inter, Segoe UI, sans-serif
- Clean, professional hierarchy

## Development

### Backend Development
```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create test data
python manage.py shell
# Use Django ORM to create test cases, judges, lawyers

# Run tests
python manage.py test
```

### Frontend Development
```bash
cd frontend

# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment Considerations

### Backend
- Set `DEBUG = False` in production
- Use PostgreSQL instead of SQLite
- Configure proper `ALLOWED_HOSTS`
- Use environment variables for secrets
- Set up proper static file serving

### Frontend
- Build with `npm run build`
- Serve from `dist/` directory
- Update API base URL for production
- Enable caching and compression

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

© 2025 Nya-Alaya. All rights reserved.

## Support

For issues and questions, please create an issue in the repository.

---

**सत्यमेव जयते** (Truth Alone Triumphs)

