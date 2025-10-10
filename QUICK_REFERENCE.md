# 🎯 Quick Reference Card - Nya-Alaya

## 🚀 Start Commands

```bash
# Terminal 1: Start Backend
cd /Users/primivista/Desktop/M1/djp/court_agent
python manage.py runserver

# Terminal 2: Start Frontend  
cd /Users/primivista/Desktop/M1/djp/court_agent/frontend
npm run dev
```

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://127.0.0.1:8000/api/ |
| Django Admin | http://127.0.0.1:8000/admin/ |
| Health Check | http://127.0.0.1:8000/api/health/ |

## 📍 API Endpoints

| Resource | Endpoint | Methods |
|----------|----------|---------|
| Cases | `/api/cases/` | GET, POST, PUT, DELETE |
| Judges | `/api/judges/` | GET, POST, PUT, DELETE |
| Lawyers | `/api/lawyers/` | GET, POST, PUT, DELETE |
| Schedules | `/api/schedules/` | GET, POST, PUT, DELETE |

## 🎨 Color Palette

```css
Primary Blue:    #1a4d8f  /* Authority */
Saffron:         #ff9933  /* Energy */
Green:           #138808  /* Growth */
Gold:            #d4af37  /* Excellence */
Background:      #f8f9fa  /* Clean */
Text Primary:    #1a1a1a  /* Readable */
```

## 🧭 Navigation

| Page | Icon | Purpose |
|------|------|---------|
| Dashboard | 📊 | Overview & statistics |
| Cases | 📄 | Manage court cases |
| Judges | ⚖️ | Manage judges & schedules |
| Lawyers | 👥 | Manage lawyers & cases |

## ⌨️ Keyboard Shortcuts

| Action | Keys |
|--------|------|
| Refresh page | F5 |
| Open DevTools | F12 |
| Search (when in search box) | Ctrl+F |

## 🎯 Common Tasks

### Add a Case
1. Click "Cases" → "Add New Case"
2. Fill: Case Number, Type, Date, Urgency
3. Click "Create Case"

### View Judge Schedule
1. Click "Judges"
2. Click "View Schedule" on judge card
3. See all scheduled cases

### Search Cases
1. Go to "Cases"
2. Type in search box
3. Results filter automatically

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend not responding | Check if `python manage.py runserver` is running |
| Frontend blank | Check console (F12) for errors |
| CORS error | Verify both servers are running |
| Can't create case | Check all required fields are filled |

## 📦 Dependencies

### Backend
```bash
pip install django djangorestframework django-cors-headers
```

### Frontend
```bash
npm install
```

## 🎨 Design Elements

### Card Hover
```css
transform: translateY(-5px);
box-shadow: 0 8px 24px rgba(0,0,0,0.12);
```

### Modal Animation
```javascript
initial={{ scale: 0.9, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
```

## 📊 Data Format Examples

### Case JSON
```json
{
  "case_number": "CIV/2025/001",
  "case_type": "civil",
  "filed_in": "2025-01-15",
  "urgency": 0.7,
  "estimated_duration": 60
}
```

### Judge JSON
```json
{
  "name": "Justice Ramesh Kumar",
  "court": "Delhi High Court",
  "availability": []
}
```

## 🎯 Testing Checklist

- [ ] Backend health check responds
- [ ] Frontend loads without errors
- [ ] Can create a case
- [ ] Can search cases
- [ ] Can add a judge
- [ ] Can view judge schedule
- [ ] Can add a lawyer
- [ ] Dashboard shows statistics
- [ ] Animations are smooth
- [ ] Responsive on mobile

## 🌟 Pro Tips

1. **Use filters**: Quickly find cases by type
2. **Check schedules**: View individual judge schedules
3. **Hover for effects**: Enjoy the smooth animations
4. **Refresh data**: Use the refresh button on dashboard
5. **Mobile friendly**: Works great on phones too

## 📚 Documentation

- `START_HERE.md` - Getting started guide
- `README.md` - Complete documentation
- `TESTING_GUIDE.md` - Testing instructions
- `IMPLEMENTATION_SUMMARY.md` - Technical details

## 🎨 Design Philosophy

> "Clean, professional, and inspired by the Government of India's digital platforms"

- **Trustworthy**: Deep blue conveys authority
- **Energetic**: Saffron adds warmth
- **Balanced**: Green represents justice
- **Excellent**: Gold accents prestige

## 🏛️ Branding

**Name**: Nya-Alaya (न्याय आलय)
**Meaning**: House of Justice
**Motto**: सत्यमेव जयते (Truth Alone Triumphs)

---

**Keep this card handy for quick reference! 📌**

