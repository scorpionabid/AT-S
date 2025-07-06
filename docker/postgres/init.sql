-- ATİS Database Initialization Script
-- Creates necessary extensions and configurations for PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create backup user
CREATE USER atis_backup WITH PASSWORD 'atis_backup_password_2025';
GRANT CONNECT ON DATABASE atis_db TO atis_backup;
GRANT USAGE ON SCHEMA public TO atis_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO atis_backup;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO atis_backup;

-- Create read-only user for reporting
CREATE USER atis_readonly WITH PASSWORD 'atis_readonly_password_2025';
GRANT CONNECT ON DATABASE atis_db TO atis_readonly;
GRANT USAGE ON SCHEMA public TO atis_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO atis_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO atis_readonly;

-- Performance optimizations
-- Set work_mem for complex queries
ALTER SYSTEM SET work_mem = '64MB';

-- Set shared_buffers (25% of RAM, adjust based on server)
ALTER SYSTEM SET shared_buffers = '256MB';

-- Set effective_cache_size (75% of RAM, adjust based on server)
ALTER SYSTEM SET effective_cache_size = '1GB';

-- Set random_page_cost for SSD storage
ALTER SYSTEM SET random_page_cost = 1.1;

-- Enable query logging for slow queries
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_statement = 'ddl';

-- Set timezone
ALTER SYSTEM SET timezone = 'Asia/Baku';

-- Configure connection limits
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';

-- Create indexes for common search patterns
-- Note: These will be created after tables are migrated
DO $$
BEGIN
    -- This block will run after Laravel migrations
    -- Add any custom indexes here that are not handled by Laravel
END $$;

-- Reload configuration
SELECT pg_reload_conf();