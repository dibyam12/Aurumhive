import express from 'express';
import { query } from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ===========================================
// POST /api/contact
// Submit contact form (public)
// ===========================================
router.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Name, email, subject, and message are required'
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid email format'
        });
    }

    // Validate message length
    if (message.length < 10) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Message must be at least 10 characters long'
        });
    }

    try {
        const result = await query(
            `INSERT INTO contact_submissions (name, email, subject, message)
             VALUES ($1, $2, $3, $4)
             RETURNING id, created_at`,
            [name.trim(), email.trim().toLowerCase(), subject.trim(), message.trim()]
        );

        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully',
            id: result.rows[0].id
        });

    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to submit contact form'
        });
    }
});

// ===========================================
// GET /api/contact
// List all contact submissions (admin only)
// ===========================================
router.get('/', authenticateToken, async (req, res) => {
    const { page = 1, limit = 20, unread_only = false } = req.query;
    const offset = (page - 1) * limit;

    try {
        let whereClause = 'WHERE is_archived = FALSE';
        if (unread_only === 'true') {
            whereClause += ' AND is_read = FALSE';
        }

        // Get total count
        const countResult = await query(
            `SELECT COUNT(*) FROM contact_submissions ${whereClause}`
        );
        const totalCount = parseInt(countResult.rows[0].count);

        // Get submissions
        const result = await query(
            `SELECT id, name, email, subject, message, is_read, created_at
             FROM contact_submissions
             ${whereClause}
             ORDER BY created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });

    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch contact submissions'
        });
    }
});

// ===========================================
// GET /api/contact/:id
// Get single contact submission (admin only)
// ===========================================
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query(
            `SELECT id, name, email, subject, message, is_read, is_archived, created_at
             FROM contact_submissions
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Contact submission not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Get contact error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch contact submission'
        });
    }
});

// ===========================================
// PATCH /api/contact/:id/read
// Mark as read (admin only)
// ===========================================
router.patch('/:id/read', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query(
            `UPDATE contact_submissions SET is_read = TRUE WHERE id = $1 RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Contact submission not found'
            });
        }

        res.json({
            success: true,
            message: 'Marked as read'
        });

    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to mark as read'
        });
    }
});

// ===========================================
// PATCH /api/contact/:id/archive
// Archive submission (admin only)
// ===========================================
router.patch('/:id/archive', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query(
            `UPDATE contact_submissions SET is_archived = TRUE WHERE id = $1 RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Contact submission not found'
            });
        }

        res.json({
            success: true,
            message: 'Archived successfully'
        });

    } catch (error) {
        console.error('Archive error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to archive'
        });
    }
});

// ===========================================
// DELETE /api/contact/:id
// Delete submission (admin only)
// ===========================================
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query(
            `DELETE FROM contact_submissions WHERE id = $1 RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Contact submission not found'
            });
        }

        res.json({
            success: true,
            message: 'Deleted successfully'
        });

    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to delete'
        });
    }
});

export default router;
