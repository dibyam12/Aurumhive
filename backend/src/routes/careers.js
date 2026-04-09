import express from 'express';
import { query } from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ===========================================
// GET /api/careers
// List active careers (public)
// ===========================================
router.get('/', async (req, res) => {
    const { include_inactive = false } = req.query;

    try {
        let whereClause = 'WHERE is_active = TRUE';

        // Allow admin to see inactive jobs
        if (include_inactive === 'true') {
            whereClause = '';
        }

        const result = await query(
            `SELECT id, title, location, type, level, description, responsibilities, requirements, is_active, created_at
             FROM careers
             ${whereClause}
             ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Get careers error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch careers'
        });
    }
});

// ===========================================
// GET /api/careers/:id
// Get single career (public)
// ===========================================
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query(
            `SELECT id, title, location, type, level, description, responsibilities, requirements, is_active, created_at
             FROM careers
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Career not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Get career error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch career'
        });
    }
});

// ===========================================
// POST /api/careers
// Create new career (admin only)
// ===========================================
router.post('/', authenticateToken, async (req, res) => {
    const { title, location, type, level, description, responsibilities, requirements, is_active = true } = req.body;

    // Validate required fields
    if (!title) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Title is required'
        });
    }

    try {
        const result = await query(
            `INSERT INTO careers (title, location, type, level, description, responsibilities, requirements, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [title, location, type, level, description, responsibilities || [], requirements || [], is_active]
        );

        res.status(201).json({
            success: true,
            message: 'Career created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Create career error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create career'
        });
    }
});

// ===========================================
// PUT /api/careers/:id
// Update career (admin only)
// ===========================================
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, location, type, level, description, responsibilities, requirements, is_active } = req.body;

    try {
        // Check if career exists
        const existingResult = await query(
            `SELECT id FROM careers WHERE id = $1`,
            [id]
        );

        if (existingResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Career not found'
            });
        }

        const result = await query(
            `UPDATE careers 
             SET title = COALESCE($1, title),
                 location = COALESCE($2, location),
                 type = COALESCE($3, type),
                 level = COALESCE($4, level),
                 description = COALESCE($5, description),
                 responsibilities = COALESCE($6, responsibilities),
                 requirements = COALESCE($7, requirements),
                 is_active = COALESCE($8, is_active)
             WHERE id = $9
             RETURNING *`,
            [title, location, type, level, description, responsibilities, requirements, is_active, id]
        );

        res.json({
            success: true,
            message: 'Career updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Update career error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update career'
        });
    }
});

// ===========================================
// DELETE /api/careers/:id
// Delete career (admin only)
// ===========================================
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query(
            `DELETE FROM careers WHERE id = $1 RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Career not found'
            });
        }

        res.json({
            success: true,
            message: 'Career deleted successfully'
        });

    } catch (error) {
        console.error('Delete career error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to delete career'
        });
    }
});

export default router;
