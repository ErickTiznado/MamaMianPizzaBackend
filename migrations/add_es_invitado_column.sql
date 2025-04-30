-- Migration to add es_invitado column to usuarios table
ALTER TABLE usuarios ADD COLUMN es_invitado BOOLEAN DEFAULT FALSE;

-- Update existing records to set es_invitado = FALSE
UPDATE usuarios SET es_invitado = FALSE WHERE es_invitado IS NULL;