#!/bin/bash

# Initialize the database with schema
sqlite3 db/forms.db < db/schema.sql

echo "Database initialized successfully"
