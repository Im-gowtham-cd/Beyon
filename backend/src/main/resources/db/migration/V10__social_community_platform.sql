CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_type VARCHAR(30) NOT NULL CHECK (author_type IN ('STUDENT','COMPANY','INSTITUTION')),
    post_type VARCHAR(30) NOT NULL DEFAULT 'TEXT' CHECK (post_type IN ('TEXT','ACHIEVEMENT','PROJECT','CERTIFICATION','ARTICLE','SHARED')),
    title VARCHAR(300),
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    reference_type VARCHAR(50),
    reference_id UUID,
    like_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    share_count INTEGER NOT NULL DEFAULT 0,
    visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC','FOLLOWERS','PRIVATE')),
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_social_posts_author ON social_posts (author_id);
CREATE INDEX idx_social_posts_type ON social_posts (post_type);
CREATE INDEX idx_social_posts_created ON social_posts (created_at DESC);
CREATE INDEX idx_social_posts_visibility ON social_posts (visibility);

CREATE TABLE social_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES social_comments(id),
    content TEXT NOT NULL,
    like_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_social_comments_post ON social_comments (post_id);
CREATE INDEX idx_social_comments_author ON social_comments (author_id);

CREATE TABLE social_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(30) NOT NULL CHECK (target_type IN ('POST','COMMENT')),
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX idx_social_likes_target ON social_likes (target_type, target_id);

CREATE TABLE discussion_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(10),
    color VARCHAR(7),
    parent_category_id UUID REFERENCES discussion_categories(id),
    thread_count INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE discussion_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES discussion_categories(id),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    tags JSONB DEFAULT '[]',
    reply_count INTEGER NOT NULL DEFAULT 0,
    view_count INTEGER NOT NULL DEFAULT 0,
    like_count INTEGER NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    solved BOOLEAN NOT NULL DEFAULT false,
    last_reply_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_discussion_threads_category ON discussion_threads (category_id);
CREATE INDEX idx_discussion_threads_author ON discussion_threads (author_id);
CREATE INDEX idx_discussion_threads_created ON discussion_threads (created_at DESC);

CREATE TABLE discussion_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES discussion_replies(id),
    content TEXT NOT NULL,
    like_count INTEGER NOT NULL DEFAULT 0,
    is_accepted_answer BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_discussion_replies_thread ON discussion_replies (thread_id);
CREATE INDEX idx_discussion_replies_author ON discussion_replies (author_id);

CREATE TABLE verified_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL CHECK (achievement_type IN ('CERTIFICATION','HACKATHON','COMPETITION','PUBLICATION','PATENT','OPEN_SOURCE','LEADERSHIP','COMMUNITY','SPORTS','ARTS')),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    issuing_organization VARCHAR(200),
    issue_date DATE,
    expiry_date DATE,
    credential_id VARCHAR(200),
    credential_url VARCHAR(500),
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING','VERIFIED','REJECTED','EXPIRED')),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    evidence_urls JSONB DEFAULT '[]',
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verified_achievements_student ON verified_achievements (student_id);
CREATE INDEX idx_verified_achievements_type ON verified_achievements (achievement_type);
CREATE INDEX idx_verified_achievements_status ON verified_achievements (verification_status);

CREATE TABLE message_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_type VARCHAR(20) NOT NULL DEFAULT 'DIRECT' CHECK (conversation_type IN ('DIRECT','GROUP')),
    title VARCHAR(200),
    last_message_at TIMESTAMPTZ,
    last_message_preview VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE message_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES message_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    unread_count INTEGER NOT NULL DEFAULT 0,
    last_read_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (conversation_id, user_id)
);

CREATE INDEX idx_message_participants_user ON message_participants (user_id);
CREATE INDEX idx_message_participants_conversation ON message_participants (conversation_id);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES message_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) NOT NULL DEFAULT 'TEXT' CHECK (message_type IN ('TEXT','IMAGE','FILE','SYSTEM')),
    attachment_url VARCHAR(500),
    is_edited BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages (conversation_id);
CREATE INDEX idx_messages_sender ON messages (sender_id);
CREATE INDEX idx_messages_created ON messages (created_at DESC);

CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    email_enabled BOOLEAN NOT NULL DEFAULT false,
    push_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, notification_type)
);

CREATE INDEX idx_notification_preferences_user ON notification_preferences (user_id);

CREATE TABLE content_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(30) NOT NULL CHECK (resource_type IN ('ARTICLE','TUTORIAL','VIDEO','COURSE','BOOK','TOOL')),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    skill_ids UUID[],
    difficulty VARCHAR(20) CHECK (difficulty IN ('BEGINNER','INTERMEDIATE','ADVANCED')),
    is_free BOOLEAN NOT NULL DEFAULT true,
    view_count INTEGER NOT NULL DEFAULT 0,
    bookmark_count INTEGER NOT NULL DEFAULT 0,
    rating DECIMAL(2,1),
    tags JSONB DEFAULT '[]',
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_resources_author ON content_resources (author_id);
CREATE INDEX idx_content_resources_type ON content_resources (resource_type);
CREATE INDEX idx_content_resources_status ON content_resources (status);

CREATE TABLE content_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES content_resources(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, resource_id)
);

CREATE TABLE admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(200) NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_log_admin ON admin_audit_log (admin_id);
CREATE INDEX idx_admin_audit_log_created ON admin_audit_log (created_at DESC);

CREATE TABLE platform_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_type VARCHAR(20) NOT NULL DEFAULT 'COUNTER' CHECK (metric_type IN ('COUNTER','GAUGE','HISTOGRAM')),
    tags JSONB,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_platform_metrics_name ON platform_metrics (metric_name);
CREATE INDEX idx_platform_metrics_recorded ON platform_metrics (recorded_at DESC);
