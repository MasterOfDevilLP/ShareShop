BEGIN;
    ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);
COMMIT;