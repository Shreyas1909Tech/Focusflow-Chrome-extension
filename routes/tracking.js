const express = require('express');
const router = express.Router();
const TrackingSession = require('../models/TrackingSession');

// POST /api/tracking/sync
// Called by extension every minute with latest session data
router.post('/sync', async (req, res) => {
  try {
    const { userId, date, siteData } = req.body;

    if (!userId || !date || !siteData) {
      return res.status(400).json({ error: 'Missing required fields: userId, date, siteData' });
    }

    // Convert siteData object { domain: seconds } to array format
    const siteArray = Object.entries(siteData).map(([domain, seconds]) => ({
      domain,
      seconds: Math.floor(seconds)
    }));

    const totalSeconds = siteArray.reduce((acc, s) => acc + s.seconds, 0);

    // Upsert: update if exists, create if not
    const session = await TrackingSession.findOneAndUpdate(
      { userId, date },
      {
        siteData: siteArray,
        totalSeconds,
        lastSynced: new Date()
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({ 
      success: true, 
      session: {
        date: session.date,
        totalSeconds: session.totalSeconds,
        siteCount: session.siteData.length,
        productivityScore: session.productivityScore,
        lastSynced: session.lastSynced
      }
    });
  } catch (err) {
    console.error('[Tracking Sync Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tracking/:userId/today
router.get('/:userId/today', async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const session = await TrackingSession.findOne({ userId, date: today });
    if (!session) {
      return res.json({ 
        date: today, 
        totalSeconds: 0, 
        siteData: [],
        productivityScore: 100
      });
    }

    res.json({
      date: session.date,
      totalSeconds: session.totalSeconds,
      siteData: session.siteData.sort((a, b) => b.seconds - a.seconds),
      productivityScore: session.productivityScore,
      lastSynced: session.lastSynced
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tracking/:userId/history?days=7
router.get('/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days) || 7;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const sessions = await TrackingSession.find({
      userId,
      date: { $gte: cutoffStr }
    }).sort({ date: -1 }).lean();

    // Add productivity score to lean objects
    const result = sessions.map(s => {
      const distractingSites = ['youtube.com','reddit.com','twitter.com','facebook.com',
        'instagram.com','tiktok.com','netflix.com','twitch.tv','x.com'];
      const distractingTime = s.siteData
        .filter(sd => distractingSites.some(d => sd.domain.includes(d)))
        .reduce((acc, sd) => acc + sd.seconds, 0);
      const score = s.totalSeconds > 0 
        ? Math.max(0, Math.round(100 - (distractingTime / s.totalSeconds) * 100))
        : 100;
      return { ...s, productivityScore: score };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
