import express from 'express';
import { query } from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ===========================================
// GET /api/stats
// Get traffic and analytics stats (admin only)
// ===========================================
router.get('/', authenticateToken, async (req, res) => {
    const { days = 30 } = req.query;

    try {
        // Total visitors
        const totalVisitors = await query(
            `SELECT COUNT(*) as count FROM visitors WHERE created_at >= CURRENT_DATE - $1::integer`,
            [days]
        );

        // Visitors by day
        const visitorsByDay = await query(
            `SELECT DATE(created_at) as date, COUNT(*) as count
             FROM visitors
             WHERE created_at >= CURRENT_DATE - $1::integer
             GROUP BY DATE(created_at)
             ORDER BY date`,
            [days]
        );

        // Visitors by country
        const visitorsByCountry = await query(
            `SELECT country, country_code, COUNT(*) as count
             FROM visitors
             WHERE created_at >= CURRENT_DATE - $1::integer AND country IS NOT NULL
             GROUP BY country, country_code
             ORDER BY count DESC
             LIMIT 10`,
            [days]
        );

        // Visitors by city
        const visitorsByCity = await query(
            `SELECT city, region, country, COUNT(*) as count
             FROM visitors
             WHERE created_at >= CURRENT_DATE - $1::integer AND city IS NOT NULL
             GROUP BY city, region, country
             ORDER BY count DESC
             LIMIT 10`,
            [days]
        );

        // Consent types
        const consentStats = await query(
            `SELECT consent_type, COUNT(*) as count
             FROM visitors
             WHERE created_at >= CURRENT_DATE - $1::integer
             GROUP BY consent_type`,
            [days]
        );

        // Unread contact messages
        const unreadContacts = await query(
            `SELECT COUNT(*) as count FROM contact_submissions WHERE is_read = FALSE AND is_archived = FALSE`
        );

        // Total contact submissions
        const totalContacts = await query(
            `SELECT COUNT(*) as count FROM contact_submissions WHERE created_at >= CURRENT_DATE - $1::integer`,
            [days]
        );

        // Active job listings
        const activeJobs = await query(
            `SELECT COUNT(*) as count FROM careers WHERE is_active = TRUE`
        );

        // Recent visitors (last 10)
        const recentVisitors = await query(
            `SELECT ip_address, city, region, country, consent_type, created_at
             FROM visitors
             ORDER BY created_at DESC
             LIMIT 10`
        );

        res.json({
            success: true,
            data: {
                overview: {
                    totalVisitors: parseInt(totalVisitors.rows[0].count),
                    unreadContacts: parseInt(unreadContacts.rows[0].count),
                    totalContacts: parseInt(totalContacts.rows[0].count),
                    activeJobs: parseInt(activeJobs.rows[0].count)
                },
                visitorsByDay: visitorsByDay.rows,
                visitorsByCountry: visitorsByCountry.rows,
                visitorsByCity: visitorsByCity.rows,
                consentStats: consentStats.rows,
                recentVisitors: recentVisitors.rows.map(v => ({
                    ...v,
                    ip_address: v.ip_address ? v.ip_address.substring(0, v.ip_address.lastIndexOf('.')) + '.***' : 'unknown' // Mask last octet
                })),
                period: `Last ${days} days`
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch stats'
        });
    }
});

// ===========================================
// GET /api/stats/visitors/raw
// Get raw visitor data for export (admin only)
// ===========================================
router.get('/visitors/raw', authenticateToken, async (req, res) => {
    const { page = 1, limit = 50, days = 30 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const countResult = await query(
            `SELECT COUNT(*) FROM visitors WHERE created_at >= CURRENT_DATE - $1::integer`,
            [days]
        );
        const totalCount = parseInt(countResult.rows[0].count);

        const result = await query(
            `SELECT id, ip_address, city, region, country, country_code, 
                    latitude, longitude, timezone, consent_type, 
                    user_agent, referrer, created_at
             FROM visitors
             WHERE created_at >= CURRENT_DATE - $1::integer
             ORDER BY created_at DESC
             LIMIT $2 OFFSET $3`,
            [days, limit, offset]
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
        console.error('Get raw visitors error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch visitor data'
        });
    }
});

export default router;
