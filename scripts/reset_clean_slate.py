"""
Beyon Clean-Slate Database Reset Script
Purges all student, company, and institution records, mock drives,
applications, and runtime session data while preserving:
- The 6 official platform admin accounts
- Platform reference catalogs (skills, questions, taxonomy, career paths)
"""

import pymysql
import sys

def reset_database():
    print("🧹 Connecting to Dolt database 'beyon' on 127.0.0.1:3306...")
    conn = pymysql.connect(
        host='127.0.0.1',
        port=3306,
        user='root',
        password='',
        database='beyon',
        autocommit=True
    )

    tables_to_clear = [
        # Student profiles, skills, activities & practice
        'student_profiles',
        'student_skills',
        'student_streaks',
        'student_learning_skills',
        'student_learning_topics',
        'student_links',
        'student_practice_stats',
        'student_question_attempts',
        'test_attempts',
        'identity_verifications',

        # Institution data
        'institution_profiles',
        'institution_students',
        'placement_drives',

        # Company data & recruitment
        'company_profiles',
        'company_opportunities',
        'opportunity_applications',
        'recruitment_applications',
        'recruitment_drives',
        'recruitment_placements',
        'recruitment_status_history',

        # Assessments & Proctoring runtime attempts
        'assessment_sessions',
        'assessment_answers',
        'assessment_audit_events',
        'assessment_results',
        'assessment_reattempt_requests',
        'assessment_question_order',
        'proctoring_sessions',
        'proctoring_devices',
        'proctoring_evidence',
        'proctoring_incidents',
        'proctoring_risk_scores',
        'system_check_results',

        # Financial & User transactional records
        'coin_wallets',
        'coin_transactions',
        'skill_xp_transactions',
        'notifications',
        'realtime_events',
        'audit_events',
        'email_verification_tokens',
        'messages',
        'message_conversations',
        'message_participants',
        'project_teams',
    ]

    with conn.cursor() as cur:
        cur.execute('SET FOREIGN_KEY_CHECKS = 0;')
        for t in tables_to_clear:
            try:
                cur.execute(f'TRUNCATE TABLE `{t}`;')
                print(f'  ✓ Cleared {t}')
            except Exception:
                try:
                    cur.execute(f'DELETE FROM `{t}`;')
                    print(f'  ✓ Deleted from {t}')
                except Exception as err:
                    print(f'  ⚠️ Could not clear {t}: {err}')

        # Delete all users except the 6 official platform admins
        cur.execute('''
            DELETE FROM users WHERE email NOT IN (
                'superadmin@beyon.io',
                'verifier@beyon.io',
                'skillcontent@beyon.io',
                'questionsetter@beyon.io',
                'supportadmin@beyon.io',
                'analytics@beyon.io'
            );
        ''')
        print("  ✓ Purged all non-admin users from 'users'")

        # Ensure all 6 admin accounts have clean attributes
        cur.execute('''
            UPDATE users SET
                institution_id = NULL,
                company_id = NULL,
                department_id = NULL,
                status = 'ACTIVE',
                profile_status = 'COMPLETED',
                email_verified = 1,
                follower_count = 0,
                following_count = 0
            WHERE email IN (
                'superadmin@beyon.io',
                'verifier@beyon.io',
                'skillcontent@beyon.io',
                'questionsetter@beyon.io',
                'supportadmin@beyon.io',
                'analytics@beyon.io'
            );
        ''')
        print("  ✓ Verified and sanitized 6 official admin accounts")

        cur.execute('SET FOREIGN_KEY_CHECKS = 1;')

        cur.execute('SELECT email, role, status FROM users ORDER BY email;')
        print("\nActive Accounts in 'beyon.users':")
        for row in cur.fetchall():
            print(f"  • {row[0]:<25} | Role: {row[1]:<20} | Status: {row[2]}")

    conn.close()
    print("\n🎉 Database reset complete! Clean slate ready for manual testing.")

if __name__ == '__main__':
    reset_database()
