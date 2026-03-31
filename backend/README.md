# Backend - Barber App

## Setup

1. Copy `.env` and configure your database URL
2. `npm install`
3. `npx prisma migrate dev`
4. `npx prisma db seed`
5. `npm run dev`

## Default Admin Credentials

- Email: almog@barber.com
- Password: admin123

## API Endpoints

### Auth
- `POST /api/auth/login` - Login

### Appointments
- `GET    /api/appointments` - List appointments (query: date, week)
- `GET    /api/appointments/:id` - Get single appointment
- `POST   /api/appointments` - Create appointment
- `PUT    /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Settings
- `GET /api/settings` - Get business settings
- `PUT /api/settings` - Update business settings

### Schedule
- `GET /api/schedule/available-slots?date=YYYY-MM-DD` - Get available time slots
