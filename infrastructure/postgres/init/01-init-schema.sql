-- Vision Platform Database Schema
-- PostgreSQL DDL with idempotent migrations

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    avatar_url TEXT,
    microsoft_id VARCHAR(255),
    google_id VARCHAR(255),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'active',
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_microsoft_id ON users(microsoft_id);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500),
    original_filename VARCHAR(500),
    file_path TEXT,
    file_size BIGINT,
    mime_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'uploaded',
    processing_error TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Translations table
CREATE TABLE IF NOT EXISTS translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    source_text TEXT NOT NULL,
    translated_text TEXT,
    source_language VARCHAR(10),
    target_language VARCHAR(10),
    provider VARCHAR(50),
    model VARCHAR(100),
    confidence_score DECIMAL(3,2),
    cached BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_translations_user_id ON translations(user_id);
CREATE INDEX IF NOT EXISTS idx_translations_document_id ON translations(document_id);
CREATE INDEX IF NOT EXISTS idx_translations_languages ON translations(source_language, target_language);
CREATE INDEX IF NOT EXISTS idx_translations_created_at ON translations(created_at DESC);

-- OCR Results table
CREATE TABLE IF NOT EXISTS ocr_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    page_number INTEGER,
    text_content TEXT,
    bounding_boxes JSONB,
    confidence_score DECIMAL(3,2),
    provider VARCHAR(50),
    processing_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ocr_results_document_id ON ocr_results(document_id);
CREATE INDEX IF NOT EXISTS idx_ocr_results_page_number ON ocr_results(page_number);

-- Analytics Events table
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    feature VARCHAR(100) NOT NULL,
    action VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_feature ON analytics(feature);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics(session_id);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_name VARCHAR(100),
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    razorpay_subscription_id VARCHAR(255),
    razorpay_customer_id VARCHAR(255),
    status VARCHAR(50),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- Conversations table (for AI assistant)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    title VARCHAR(500),
    context TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_document_id ON conversations(document_id);

-- Messages table (for conversation history)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Document chunks for vector search
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER,
    content TEXT,
    embedding vector(1536), -- Requires pgvector extension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops);

-- Create update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to tables with updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user if not exists
INSERT INTO users (email, name, subscription_tier, subscription_status, email_verified, is_active)
VALUES ('admin@visionplatform.com', 'Admin User', 'enterprise', 'active', true, true)
ON CONFLICT (email) DO NOTHING;
