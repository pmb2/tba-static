#!/usr/bin/env python3
import sys
import sqlite3
import json
import yaml
import os

def init_db():
    # Initialize the database if it doesn't exist
    if not os.path.exists('db/forms.db') or os.path.getsize('db/forms.db') == 0:
        conn = sqlite3.connect('db/forms.db')
        with open('db/schema.sql', 'r') as f:
            conn.executescript(f.read())
        conn.commit()
        conn.close()

def process_form_submission(title, body):
    form_type = ''
    data = {}
    
    # Parse the form type from the title
    if 'Contact Form' in title:
        form_type = 'contact_form'
    elif 'Newsletter Form' in title:
        form_type = 'newsletter_form'
    else:
        print(f"Unknown form type in title: {title}")
        return
    
    # Parse the YAML/JSON from the issue body
    try:
        data = yaml.safe_load(body)
    except yaml.YAMLError:
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            print(f"Could not parse form data: {body}")
            return
    
    # Connect to the database
    conn = sqlite3.connect('db/forms.db')
    cursor = conn.cursor()
    
    if form_type == 'contact_form':
        # Insert into contact_form table
        cursor.execute(
            "INSERT INTO contact_form (name, email, message) VALUES (?, ?, ?)",
            (data.get('name', ''), data.get('email', ''), data.get('message', ''))
        )
    elif form_type == 'newsletter_form':
        # Insert into newsletter_form table
        cursor.execute(
            "INSERT INTO newsletter_form (email) VALUES (?)",
            (data.get('email', ''),)
        )
    
    conn.commit()
    conn.close()
    print(f"Successfully processed {form_type} submission")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: process_form.py <title> <body>")
        sys.exit(1)
    
    title = sys.argv[1]
    body = sys.argv[2]
    
    init_db()
    process_form_submission(title, body)
