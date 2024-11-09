-- -- Drop the existing database (if any)
-- DROP DATABASE IF EXISTS oxlabchallenge;;

-- -- Create a new database
-- CREATE DATABASE oxlabchallenge;;

-- Create a superuser
-- CREATE ROLE salal WITH LOGIN SUPERUSER PASSWORD 'salal123';

-- Grant all privileges to the superuser on the new database
GRANT ALL PRIVILEGES ON DATABASE oxlabchallenge TO salal;
