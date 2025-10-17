# GramAlert Plus

A full-stack rural governance platform connecting villagers with their local panchayat for utility alerts and grievance management.

## Project Overview

GramAlert Plus enables:
- **Utility Alerts**: Panchayat admins post notices about power/water outages, road closures, and health warnings
- **Grievance Submission**: Villagers submit issues with photos, location, and category
- **Status Tracking**: Real-time tracking from Received → In Progress → Resolved
- **Priority & Escalation**: Automatic prioritization and escalation of overdue issues to higher authorities

## Tech Stack

### Frontend
- React 18 with TypeScript
- Next.js 14 (App Router)
- Tailwind CSS v4
- shadcn/ui components

### Backend
- Java 17
- Spring Boot 3.2
- Spring Security
- (TODO) PostgreSQL/MySQL
- (TODO) JWT Authentication

## Getting Started

### Frontend

The frontend is a fully working React application that you can run immediately:

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open [http://localhost:3000](http://localhost:3000)

4. Login with demo credentials:
   - **Villager**: `villager` / `password`
   - **Admin**: `admin` / `password`

### Backend

The backend is starter code with mock data. See `backend/README.md` for setup instructions.

To run the backend:

\`\`\`bash
cd backend
mvn spring-boot:run
\`\`\`

API will be available at `http://localhost:8080`

## Project Structure

\`\`\`
gramalert-plus/
├── app/                          # Next.js pages
│   ├── login/                    # Login page
│   ├── villager-dashboard/       # Villager dashboard
│   ├── admin-dashboard/          # Admin dashboard
│   └── layout.tsx                # Root layout with auth provider
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── protected-route.tsx       # Route protection
│   ├── map-picker.tsx            # Map placeholder
│   └── submit-request-dialog.tsx # Grievance submission form
├── lib/                          # Utilities
│   └── auth-context.tsx          # Authentication context
├── backend/                      # Spring Boot backend
│   └── src/main/java/com/gramalertplus/
│       ├── controller/           # REST controllers
│       ├── config/               # Security config
│       ├── db/                   # Database placeholder
│       └── maps/                 # Maps service placeholder
└── README.md
\`\`\`

## Features

### Implemented (Frontend)
- User authentication with role-based routing
- Villager dashboard with request submission
- Admin dashboard with status management
- Alert notifications
- Priority and overdue highlighting
- Responsive design

### Implemented (Backend - Mock Data)
- Authentication endpoint
- Grievance CRUD endpoints
- Alerts endpoints
- Sample data responses

### TODO
- Database integration (PostgreSQL/MySQL)
- JWT authentication
- File upload for photos/documents
- Maps integration (Leaflet/OpenStreetMap)
- Escalation system with notifications
- Email/SMS notifications
- Analytics and reporting

## Maps Integration

The frontend has a placeholder `MapPicker` component. To integrate maps:

### Option 1: Leaflet (Free)
\`\`\`bash
npm install leaflet react-leaflet
\`\`\`

See `components/map-picker.tsx` and `backend/src/main/java/com/gramalertplus/maps/MapsService.java` for implementation details.

### Option 2: Google Maps
Requires API key. See `MapsService.java` for instructions.

## Database Setup

1. Install PostgreSQL or MySQL
2. Create database: `gramalert_db`
3. Run `backend/src/main/resources/schema.sql`
4. Configure `backend/src/main/resources/application.properties`
5. Uncomment database dependencies in `backend/pom.xml`

See `backend/src/main/java/com/gramalertplus/db/DatabaseConfig.java` for detailed instructions.

## Deployment

### Frontend
Deploy to Vercel (recommended):
\`\`\`bash
vercel deploy
\`\`\`

### Backend
Deploy to any Java hosting service:
- Heroku
- AWS Elastic Beanstalk
- Google Cloud Run
- DigitalOcean App Platform

## Contributing

This is a starter template. Key areas for contribution:
1. Database integration
2. JWT authentication
3. Maps integration
4. File upload
5. Escalation system
6. Notifications
7. Analytics dashboard

## License

MIT License - feel free to use for your rural governance projects!
