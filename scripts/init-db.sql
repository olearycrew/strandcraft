-- StrandCraft Database Initialization Script
-- This script creates the puzzles table with all necessary columns and indexes

CREATE TABLE IF NOT EXISTS puzzles (
    id              SERIAL PRIMARY KEY,
    slug            VARCHAR(6) UNIQUE NOT NULL,
    title           VARCHAR(100) NOT NULL,
    author          VARCHAR(50) NOT NULL,
    theme_clue      VARCHAR(200) NOT NULL,
    
    -- Grid stored as a flat 48-character string (row-major order)
    -- Position = row * 6 + col (0-indexed)
    grid_letters    CHAR(48) NOT NULL,
    
    -- Spangram data
    spangram_word   VARCHAR(20) NOT NULL,
    spangram_path   JSONB NOT NULL,  -- Array of {row, col} coordinates
    
    -- Theme words data
    theme_words     JSONB NOT NULL,  -- Array of { word: string, path: {row, col}[] }
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_grid_length CHECK (LENGTH(grid_letters) = 48)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_puzzles_slug ON puzzles(slug);
CREATE INDEX IF NOT EXISTS idx_puzzles_created_at ON puzzles(created_at DESC);

-- Display success message
SELECT 'Database initialized successfully!' AS status;
