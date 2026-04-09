import express from 'express';
import { query } from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ===========================================
// GET /api/content
// Get all site content (public)
// ===========================================
router.get('/', async (req, res) => {
    try {
        const result = await query(
            `SELECT section_key, content, updated_at FROM site_content ORDER BY section_key`
        );

        // Transform to key-value object
        const content = {};
        result.rows.forEach(row => {
            content[row.section_key] = row.content;
        });

        res.json({
            success: true,
            data: content
        });

    } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch content'
        });
    }
});

// ===========================================
// GET /api/content/:key
// Get specific content section (public)
// ===========================================
router.get('/:key', async (req, res) => {
    const { key } = req.params;

    try {
        const result = await query(
            `SELECT section_key, content, updated_at FROM site_content WHERE section_key = $1`,
            [key]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Content section '${key}' not found`
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Get content section error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch content section'
        });
    }
});

// ===========================================
// PUT /api/content/:key
// Update content section (admin only)
// ===========================================
router.put('/:key', authenticateToken, async (req, res) => {
    const { key } = req.params;
    const { content } = req.body;

    if (content === undefined) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Content is required'
        });
    }

    try {
        const result = await query(
            `INSERT INTO site_content (section_key, content, updated_by)
             VALUES ($1, $2, $3)
             ON CONFLICT (section_key) 
             DO UPDATE SET content = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP
             RETURNING section_key, content, updated_at`,
            [key, JSON.stringify(content), req.user.id]
        );

        res.json({
            success: true,
            message: 'Content updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Update content error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update content'
        });
    }
});

// ===========================================
// DELETE /api/content/:key
// Delete content section (admin only)
// ===========================================
router.delete('/:key', authenticateToken, async (req, res) => {
    const { key } = req.params;

    // Prevent deletion of core sections
    const coreSections = ['siteMeta', 'heroContent', 'services', 'aboutSection'];
    if (coreSections.includes(key)) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Cannot delete core content sections'
        });
    }

    try {
        const result = await query(
            `DELETE FROM site_content WHERE section_key = $1 RETURNING section_key`,
            [key]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Content section not found'
            });
        }

        res.json({
            success: true,
            message: 'Content section deleted successfully'
        });

    } catch (error) {
        console.error('Delete content error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to delete content section'
        });
    }
});

export default router;
