import express from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

// ===========================================
// POST /api/visitors
// Track visitor consent and location
// ===========================================
router.post('/', async (req, res) => {
    const { consent_type = 'accepted' } = req.body;

    // Get IP address
    const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.ip ||
        'unknown';

    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || req.headers['referrer'] || '';

    try {
        // Try to get location from IP using free IP geolocation API
        let locationData = {
            city: null,
            region: null,
            country: null,
            country_code: null,
            latitude: null,
            longitude: null,
            timezone: null
        };

        // Only fetch geolocation for non-localhost IPs
        if (ip && ip !== 'unknown' && !ip.includes('127.0.0.1') && !ip.includes('::1')) {
            try {
                const geoResponse = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country,countryCode,lat,lon,timezone`);
                if (geoResponse.ok) {
                    const geoData = await geoResponse.json();
                    if (geoData.city) {
                        locationData = {
                            city: geoData.city,
                            region: geoData.regionName,
                            country: geoData.country,
                            country_code: geoData.countryCode,
                            latitude: geoData.lat,
                            longitude: geoData.lon,
                            timezone: geoData.timezone
                        };
                    }
                }
            } catch (geoError) {
                console.log('Geolocation lookup failed:', geoError.message);
            }
        }

        // Insert visitor record
        const result = await query(
            `INSERT INTO visitors 
             (ip_address, city, region, country, country_code, latitude, longitude, timezone, consent_type, user_agent, referrer)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING id`,
            [
                ip,
                locationData.city,
                locationData.region,
                locationData.country,
                locationData.country_code,
                locationData.latitude,
                locationData.longitude,
                locationData.timezone,
                consent_type,
                userAgent.substring(0, 500), // Limit user agent length
                referrer.substring(0, 255) // Limit referrer length
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Visitor tracked successfully',
            id: result.rows[0].id
        });

    } catch (error) {
        console.error('Visitor tracking error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to track visitor'
        });
    }
});

export default router;
