import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Constants
const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

/**
 * Generate access token
 */
const generateAccessToken = (userId, username) => {
    return jwt.sign(
        { userId, username },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
};

/**
 * Generate refresh token and store in database
 */
const generateRefreshToken = async (userId) => {
    const token = crypto.randomBytes(64).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    await query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
        [userId, tokenHash, expiresAt]
    );

    return token;
};

/**
 * Log login attempt for security
 */
const logLoginAttempt = async (ip, username, success) => {
    await query(
        `INSERT INTO login_attempts (ip_address, username, success) VALUES ($1, $2, $3)`,
        [ip, username, success]
    );
};

// ===========================================
// POST /api/auth/login
// ===========================================
router.post('/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Username and password are required'
        });
    }

    try {
        // Find user
        const result = await query(
            `SELECT id, username, email, password_hash, is_active FROM admin_users WHERE username = $1`,
            [username]
        );

        if (result.rows.length === 0) {
            await logLoginAttempt(ip, username, false);
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid username or password'
            });
        }

        const user = result.rows[0];

        // Check if account is active
        if (!user.is_active) {
            await logLoginAttempt(ip, username, false);
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Account is deactivated'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            await logLoginAttempt(ip, username, false);
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid username or password'
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user.id, user.username);
        const refreshToken = await generateRefreshToken(user.id);

        // Update last login
        await query(
            `UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
            [user.id]
        );

        // Log successful login
        await logLoginAttempt(ip, username, true);

        // Set refresh token as HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: REFRESH_TOKEN_EXPIRY_MS
        });

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            accessToken
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Login failed'
        });
    }
});

// ===========================================
// POST /api/auth/refresh
// ===========================================
router.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Refresh token is required'
        });
    }

    try {
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        // Find valid refresh token
        const result = await query(
            `SELECT rt.id, rt.user_id, au.username, au.is_active
             FROM refresh_tokens rt
             JOIN admin_users au ON rt.user_id = au.id
             WHERE rt.token_hash = $1 
             AND rt.expires_at > CURRENT_TIMESTAMP 
             AND rt.revoked_at IS NULL`,
            [tokenHash]
        );

        if (result.rows.length === 0) {
            res.clearCookie('refreshToken');
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired refresh token'
            });
        }

        const tokenData = result.rows[0];

        if (!tokenData.is_active) {
            res.clearCookie('refreshToken');
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Account is deactivated'
            });
        }

        // Revoke old refresh token
        await query(
            `UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [tokenData.id]
        );

        // Generate new tokens (token rotation)
        const newAccessToken = generateAccessToken(tokenData.user_id, tokenData.username);
        const newRefreshToken = await generateRefreshToken(tokenData.user_id);

        // Set new refresh token cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: REFRESH_TOKEN_EXPIRY_MS
        });

        res.json({
            success: true,
            accessToken: newAccessToken
        });

    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Token refresh failed'
        });
    }
});

// ===========================================
// POST /api/auth/logout
// ===========================================
router.post('/logout', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        try {
            const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
            await query(
                `UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = $1`,
                [tokenHash]
            );
        } catch (error) {
            console.error('Logout cleanup error:', error);
        }
    }

    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
});

// ===========================================
// GET /api/auth/me
// ===========================================
router.get('/me', authenticateToken, async (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// ===========================================
// POST /api/auth/change-password
// ===========================================
router.post('/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Current password and new password are required'
        });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'New password must be at least 8 characters long'
        });
    }

    try {
        // Get current password hash
        const result = await query(
            `SELECT password_hash FROM admin_users WHERE id = $1`,
            [req.user.id]
        );

        const isValidPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // Update password
        await query(
            `UPDATE admin_users SET password_hash = $1 WHERE id = $2`,
            [newPasswordHash, req.user.id]
        );

        // Revoke all refresh tokens for this user
        await query(
            `UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = $1`,
            [req.user.id]
        );

        res.json({ success: true, message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to change password'
        });
    }
});

export default router;
