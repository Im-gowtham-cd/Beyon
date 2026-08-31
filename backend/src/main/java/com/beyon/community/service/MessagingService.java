package com.beyon.community.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Service
@Transactional
public class MessagingService {
    private final JdbcTemplate jdbcTemplate;

    public MessagingService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> getContacts(UUID currentUserId, String query, String role, int limit) {
        StringBuilder sql = new StringBuilder(
            "SELECT u.id, u.email, u.display_name AS displayName, u.role, u.status, " +
            "COALESCE(ip.institution_name, cp.company_name, sp.institution, 'Independent') AS organization, " +
            "COALESCE(sp.department, cp.industry, ip.institution_type, '') AS subtitle " +
            "FROM users u " +
            "LEFT JOIN student_profiles sp ON sp.user_id = u.id " +
            "LEFT JOIN institution_profiles ip ON ip.user_id = u.id " +
            "LEFT JOIN company_profiles cp ON cp.user_id = u.id " +
            "WHERE u.status = 'ACTIVE' "
        );
        List<Object> params = new ArrayList<>();

        if (currentUserId != null) {
            sql.append("AND u.id != ? ");
            params.add(currentUserId.toString());
        }

        if (role != null && !role.trim().isEmpty() && !role.equalsIgnoreCase("ALL")) {
            sql.append("AND u.role = ? ");
            params.add(role.toUpperCase().trim());
        }

        if (query != null && !query.trim().isEmpty()) {
            sql.append("AND (LOWER(u.display_name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(COALESCE(ip.institution_name, cp.company_name, sp.institution, '')) LIKE ?) ");
            String q = "%" + query.toLowerCase().trim() + "%";
            params.add(q);
            params.add(q);
            params.add(q);
        }

        sql.append("ORDER BY u.display_name ASC LIMIT ?");
        params.add(limit > 0 ? limit : 50);

        return jdbcTemplate.queryForList(sql.toString(), params.toArray());
    }

    public Map<String, Object> startConversation(UUID senderId, UUID recipientId, String title, String firstMessage) {
        // Check if a direct conversation already exists between these 2 users
        String findExistingSql =
            "SELECT p1.conversation_id FROM message_participants p1 " +
            "JOIN message_participants p2 ON p1.conversation_id = p2.conversation_id " +
            "JOIN message_conversations mc ON mc.id = p1.conversation_id " +
            "WHERE p1.user_id = ? AND p2.user_id = ? AND mc.conversation_type = 'DIRECT' LIMIT 1";

        List<String> existing = jdbcTemplate.query(
            findExistingSql,
            (rs, rowNum) -> rs.getString("conversation_id"),
            senderId.toString(),
            recipientId.toString()
        );

        String convId;
        if (!existing.isEmpty()) {
            convId = existing.get(0);
        } else {
            convId = UUID.randomUUID().toString();
            String convTitle = (title != null && !title.trim().isEmpty()) ? title.trim() : "Direct Message";
            jdbcTemplate.update(
                "INSERT INTO message_conversations (id, conversation_type, title, last_message_at, last_message_preview, created_at, updated_at) " +
                "VALUES (?, 'DIRECT', ?, NOW(), ?, NOW(), NOW())",
                convId,
                convTitle,
                (firstMessage != null && !firstMessage.trim().isEmpty()) ? (firstMessage.length() > 95 ? firstMessage.substring(0, 95) + "..." : firstMessage) : "Conversation created"
            );

            // Add both participants
            jdbcTemplate.update(
                "INSERT INTO message_participants (id, conversation_id, user_id, unread_count, joined_at) " +
                "VALUES (UUID(), ?, ?, 0, NOW()), (UUID(), ?, ?, ?, NOW())",
                convId,
                senderId.toString(),
                convId,
                recipientId.toString(),
                (firstMessage != null && !firstMessage.trim().isEmpty()) ? 1 : 0
            );
        }

        if (firstMessage != null && !firstMessage.trim().isEmpty()) {
            sendMessage(UUID.fromString(convId), senderId, firstMessage);
        }

        return getConversationById(UUID.fromString(convId), senderId);
    }

    public List<Map<String, Object>> getMyConversations(UUID userId) {
        String sql =
            "SELECT mc.id, mc.conversation_type AS conversationType, mc.title, " +
            "mc.last_message_at AS lastMessageAt, mc.last_message_preview AS lastMessagePreview, " +
            "mp.unread_count AS unreadCount, " +
            "other_u.id AS recipientId, other_u.display_name AS recipientName, other_u.email AS recipientEmail, other_u.role AS recipientRole, " +
            "COALESCE(ip.institution_name, cp.company_name, sp.institution, 'Independent') AS recipientOrg, " +
            "COALESCE(sp.department, cp.industry, ip.institution_type, '') AS recipientSubtitle " +
            "FROM message_participants mp " +
            "JOIN message_conversations mc ON mc.id = mp.conversation_id " +
            "LEFT JOIN message_participants other_mp ON other_mp.conversation_id = mc.id AND other_mp.user_id != mp.user_id " +
            "LEFT JOIN users other_u ON other_u.id = other_mp.user_id " +
            "LEFT JOIN student_profiles sp ON sp.user_id = other_u.id " +
            "LEFT JOIN institution_profiles ip ON ip.user_id = other_u.id " +
            "LEFT JOIN company_profiles cp ON cp.user_id = other_u.id " +
            "WHERE mp.user_id = ? " +
            "ORDER BY mc.last_message_at DESC";

        return jdbcTemplate.queryForList(sql, userId.toString());
    }

    public Map<String, Object> getConversationById(UUID conversationId, UUID currentUserId) {
        String sql =
            "SELECT mc.id, mc.conversation_type AS conversationType, mc.title, " +
            "mc.last_message_at AS lastMessageAt, mc.last_message_preview AS lastMessagePreview, " +
            "other_u.id AS recipientId, other_u.display_name AS recipientName, other_u.email AS recipientEmail, other_u.role AS recipientRole, " +
            "COALESCE(ip.institution_name, cp.company_name, sp.institution, 'Independent') AS recipientOrg, " +
            "COALESCE(sp.department, cp.industry, ip.institution_type, '') AS recipientSubtitle " +
            "FROM message_conversations mc " +
            "LEFT JOIN message_participants other_mp ON other_mp.conversation_id = mc.id AND other_mp.user_id != ? " +
            "LEFT JOIN users other_u ON other_u.id = other_mp.user_id " +
            "LEFT JOIN student_profiles sp ON sp.user_id = other_u.id " +
            "LEFT JOIN institution_profiles ip ON ip.user_id = other_u.id " +
            "LEFT JOIN company_profiles cp ON cp.user_id = other_u.id " +
            "WHERE mc.id = ? LIMIT 1";

        List<Map<String, Object>> res = jdbcTemplate.queryForList(sql, currentUserId.toString(), conversationId.toString());
        return res.isEmpty() ? Collections.emptyMap() : res.get(0);
    }

    public List<Map<String, Object>> getMessages(UUID conversationId, UUID userId, int page, int size) {
        // Mark as read
        jdbcTemplate.update(
            "UPDATE message_participants SET unread_count = 0, last_read_at = NOW() WHERE conversation_id = ? AND user_id = ?",
            conversationId.toString(),
            userId.toString()
        );

        String sql =
            "SELECT m.id, m.conversation_id AS conversationId, m.sender_id AS senderId, " +
            "m.content, m.message_type AS messageType, m.created_at AS createdAt, " +
            "u.display_name AS senderName, u.email AS senderEmail, u.role AS senderRole " +
            "FROM messages m " +
            "LEFT JOIN users u ON u.id = m.sender_id " +
            "WHERE m.conversation_id = ? " +
            "ORDER BY m.created_at ASC";

        return jdbcTemplate.queryForList(sql, conversationId.toString());
    }

    public Map<String, Object> sendMessage(UUID conversationId, UUID senderId, String content) {
        String msgId = UUID.randomUUID().toString();
        String preview = content.length() > 95 ? content.substring(0, 95) + "..." : content;

        // Insert message
        jdbcTemplate.update(
            "INSERT INTO messages (id, conversation_id, sender_id, content, message_type, is_edited, is_deleted, created_at) " +
            "VALUES (?, ?, ?, ?, 'TEXT', 0, 0, NOW())",
            msgId,
            conversationId.toString(),
            senderId.toString(),
            content
        );

        // Update conversation
        jdbcTemplate.update(
            "UPDATE message_conversations SET last_message_at = NOW(), last_message_preview = ?, updated_at = NOW() WHERE id = ?",
            preview,
            conversationId.toString()
        );

        // Increment unread count for other participants
        jdbcTemplate.update(
            "UPDATE message_participants SET unread_count = unread_count + 1 WHERE conversation_id = ? AND user_id != ?",
            conversationId.toString(),
            senderId.toString()
        );

        // Return message details
        String querySql =
            "SELECT m.id, m.conversation_id AS conversationId, m.sender_id AS senderId, " +
            "m.content, m.message_type AS messageType, m.created_at AS createdAt, " +
            "u.display_name AS senderName, u.email AS senderEmail, u.role AS senderRole " +
            "FROM messages m " +
            "LEFT JOIN users u ON u.id = m.sender_id " +
            "WHERE m.id = ?";

        List<Map<String, Object>> res = jdbcTemplate.queryForList(querySql, msgId);
        return res.isEmpty() ? Collections.emptyMap() : res.get(0);
    }
}
