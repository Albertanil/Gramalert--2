-- Database Schema for GramAlert Plus
-- TODO: Execute this SQL script when setting up the database

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Store hashed password (BCrypt)
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    role VARCHAR(20) NOT NULL, -- ADMIN or VILLAGER
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grievances table
CREATE TABLE IF NOT EXISTS grievances (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- electricity, water, roads, sanitation, health, other
    status VARCHAR(20) DEFAULT 'Received', -- Received, In Progress, Resolved
    priority VARCHAR(20) DEFAULT 'Medium', -- High, Medium, Low
    user_id BIGINT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    file_url VARCHAR(500), -- URL to uploaded photo/document
    deadline TIMESTAMP, -- Auto-calculated based on category
    is_overdue BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- electricity, water, health, emergency, other
    severity VARCHAR(20) DEFAULT 'medium', -- high, medium, low
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Escalations table (for tracking overdue grievances)
CREATE TABLE IF NOT EXISTS escalations (
    id BIGSERIAL PRIMARY KEY,
    grievance_id BIGINT NOT NULL,
    escalated_to VARCHAR(100), -- Email or authority name
    escalation_level INT DEFAULT 1, -- 1 = first escalation, 2 = second, etc.
    escalated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grievance_id) REFERENCES grievances(id) ON DELETE CASCADE
);

-- Comments table (for follow-up on grievances)
CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    grievance_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grievance_id) REFERENCES grievances(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX idx_grievances_status ON grievances(status);
CREATE INDEX idx_grievances_priority ON grievances(priority);
CREATE INDEX idx_grievances_user_id ON grievances(user_id);
CREATE INDEX idx_grievances_created_at ON grievances(created_at);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

-- TODO: Add triggers for automatic deadline calculation
-- TODO: Add trigger to update 'updated_at' timestamp
-- TODO: Add stored procedure for escalation logic
