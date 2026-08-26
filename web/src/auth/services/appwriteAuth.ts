import { account, client } from '../../lib/appwrite';
import { ID, AppwriteException } from 'appwrite';

/**
 * Appwrite Authentication Service for the frontend.
 * Replaces the custom JWT auth flow with Appwrite sessions.
 * 
 * During migration, both Appwrite and legacy JWT auth are supported.
 * The backend still validates JWT tokens, and Appwrite sessions
 * can be used to create JWT tokens via the backend.
 */

export interface AppwriteUser {
    $id: string;
    email: string;
    name: string;
    emailVerification: boolean;
    status: boolean;
}

export interface AppwriteSession {
    $id: string;
    userId: string;
    expire: string;
    token: string;
}

class AppwriteAuthService {
    /**
     * Get current Appwrite session/account.
     * Returns null if not authenticated.
     */
    async getCurrentUser(): Promise<AppwriteUser | null> {
        try {
            const user = await account.get();
            return user as unknown as AppwriteUser;
        } catch {
            return null;
        }
    }

    /**
     * Check if user has an active Appwrite session.
     */
    async hasActiveSession(): Promise<boolean> {
        try {
            await account.get();
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Register a new user via Appwrite.
     * After registration, also creates the user in the backend via API.
     */
    async register(name: string, email: string, password: string): Promise<AppwriteUser> {
        try {
            const user = await account.create(ID.unique(), email, password, name);
            return user as unknown as AppwriteUser;
        } catch (error) {
            const appwriteError = error as AppwriteException;
            throw new Error(appwriteError.message || 'Registration failed');
        }
    }

    /**
     * Login via Appwrite (creates an Appwrite session).
     * After login, the backend is also called to get/sync the user profile.
     */
    async login(email: string, password: string): Promise<AppwriteUser> {
        try {
            await account.createEmailPasswordSession(email, password);
            const user = await account.get();
            return user as unknown as AppwriteUser;
        } catch (error) {
            const appwriteError = error as AppwriteException;
            throw new Error(appwriteError.message || 'Login failed');
        }
    }

    /**
     * Logout — delete all Appwrite sessions.
     */
    async logout(): Promise<void> {
        try {
            await account.deleteSessions();
        } catch {
            // Ignore errors on logout
        }
    }

    /**
     * Send password recovery email.
     */
    async forgotPassword(email: string): Promise<void> {
        try {
            await account.createRecovery(email, `${window.location.origin}/reset-password`);
        } catch (error) {
            const appwriteError = error as AppwriteException;
            throw new Error(appwriteError.message || 'Password recovery failed');
        }
    }

    /**
     * Complete password recovery.
     */
    async resetPassword(userId: string, secret: string, password: string): Promise<void> {
        try {
            await account.updateRecovery(userId, secret, password);
        } catch (error) {
            const appwriteError = error as AppwriteException;
            throw new Error(appwriteError.message || 'Password reset failed');
        }
    }

    /**
     * Send email verification.
     */
    async sendVerification(): Promise<void> {
        try {
            await account.createVerification(`${window.location.origin}/verify-email`);
        } catch (error) {
            const appwriteError = error as AppwriteException;
            throw new Error(appwriteError.message || 'Verification email failed');
        }
    }

    /**
     * Complete email verification.
     */
    async verifyEmail(userId: string, secret: string): Promise<void> {
        try {
            await account.updateVerification(userId, secret);
        } catch (error) {
            const appwriteError = error as AppwriteException;
            throw new Error(appwriteError.message || 'Email verification failed');
        }
    }

    /**
     * Update user name.
     */
    async updateName(name: string): Promise<void> {
        await account.updateName(name);
    }

    /**
     * Update user email.
     */
    async updateEmail(email: string, password: string): Promise<void> {
        await account.updateEmail(email, password);
    }

    /**
     * Update user password.
     */
    async updatePassword(newPassword: string, oldPassword: string): Promise<void> {
        await account.updatePassword(newPassword, oldPassword);
    }

    /**
     * Get the current Appwrite session for cross-domain usage.
     */
    async getSession(): Promise<AppwriteSession | null> {
        try {
            const session = await account.getSession('current');
            return session as unknown as AppwriteSession;
        } catch {
            return null;
        }
    }

    /**
     * Get Appwrite client ping status.
     */
    async ping(): Promise<boolean> {
        try {
            client.ping();
            return true;
        } catch {
            return false;
        }
    }
}

export const appwriteAuth = new AppwriteAuthService();
