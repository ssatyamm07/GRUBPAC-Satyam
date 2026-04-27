INSERT INTO users (name, email, password_hash, role)
VALUES
('Teacher 1', 'teacher@test.com', 'hashed', 'teacher'),
('Principal 1', 'principal@test.com', 'hashed', 'principal');

INSERT INTO content_slots (subject)
VALUES ('maths'), ('science');