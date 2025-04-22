-- Contact form schema
CREATE TABLE IF NOT EXISTS contact_form (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Newsletter form schema
CREATE TABLE IF NOT EXISTS newsletter_form (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);