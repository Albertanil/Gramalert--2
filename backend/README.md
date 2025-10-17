# GramAlert Plus Backend

Spring Boot REST API for the GramAlert Plus rural governance platform.

## Current Status

This is a **skeleton/starter code** with mock data. The backend provides sample API responses but does not connect to a real database yet.

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- (Optional) PostgreSQL or MySQL for database integration

## Running the Application

1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Run with Maven:
   \`\`\`bash
   mvn spring-boot:run
   \`\`\`

3. The API will be available at `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /auth/login` - Login with username and password
- `POST /auth/logout` - Logout (invalidate token)

### Grievances
- `GET /grievances` - Get all grievances (admin)
- `GET /grievances/my-requests` - Get user's grievances
- `POST /grievances` - Submit new grievance
- `PATCH /grievances/{id}` - Update grievance status
- `GET /grievances/stats` - Get statistics

### Alerts
- `GET /alerts` - Get all alerts
- `POST /alerts` - Create new alert (admin only)
- `DELETE /alerts/{id}` - Delete alert (admin only)

## Next Steps (TODO)

### 1. Database Integration
- Uncomment database dependencies in `pom.xml`
- Configure `application.properties` with database credentials
- Run `schema.sql` to create tables
- Create JPA entities, repositories, and services
- See `DatabaseConfig.java` for detailed instructions

### 2. JWT Authentication
- Uncomment JWT dependencies in `pom.xml`
- Implement JWT token generation and validation
- Add authentication filter to `SecurityConfig.java`
- Hash passwords with BCrypt

### 3. File Upload
- Implement file upload for grievance photos/documents
- Configure storage (local filesystem or cloud storage)
- Add file validation and size limits

### 4. Maps Integration
- See `MapsService.java` for integration instructions
- Implement geocoding and reverse geocoding
- Add distance calculation for location-based queries

### 5. Escalation System
- Create scheduled task to check overdue grievances
- Implement email notifications to higher authorities
- Add escalation tracking in database

### 6. Testing
- Add unit tests for controllers and services
- Add integration tests for API endpoints
- Test authentication and authorization

## Project Structure

\`\`\`
backend/
├── src/main/java/com/gramalertplus/
│   ├── GramAlertPlusApplication.java
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── GrievanceController.java
│   │   └── AlertsController.java
│   ├── config/
│   │   └── SecurityConfig.java
│   ├── db/
│   │   └── DatabaseConfig.java (placeholder)
│   └── maps/
│       └── MapsService.java (placeholder)
├── src/main/resources/
│   ├── application.properties
│   └── schema.sql
└── pom.xml
\`\`\`

## Notes

- All endpoints currently return mock data
- Security is disabled for development (see `SecurityConfig.java`)
- CORS is enabled for all origins (configure for production)
- No database connection required to run
