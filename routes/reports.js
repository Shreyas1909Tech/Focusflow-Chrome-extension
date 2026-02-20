const express = require('express');
const router = express.Router();
const TrackingSession = require('../models/TrackingSession');

// GET /api/reports/:userId/daily?date=YYYY-MM-DD
router.get('/:userId/daily', async (req, res) => {
  try {
    const { userId } = req.params;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const session = await TrackingSession.findOne({ userId, date }).lean();
    if (!session) {
      return res.json({ date, totalSeconds: 0, siteData: [], productivityScore: 100, insights: [] });
    }

    const insights = generateInsights(session);
    const topSites = [...session.siteData].sort((a, b) => b.seconds - a.seconds).slice(0, 5);

    const distractingSites = ['youtube.com','reddit.com','twitter.com','facebook.com',
      'instagram.com','tiktok.com','netflix.com','twitch.tv','x.com'];
    const distractingTime = session.siteData
      .filter(s => distractingSites.some(d => s.domain.includes(d)))
      .reduce((acc, s) => acc + s.seconds, 0);
    const productivityScore = session.totalSeconds > 0
      ? Math.max(0, Math.round(100 - (distractingTime / session.totalSeconds) * 100))
      : 100;

    res.json({
      date,
      totalSeconds: session.totalSeconds,
      totalFormatted: formatTime(session.totalSeconds),
      siteData: session.siteData,
      topSites,
      productivityScore,
      distractingTimeSeconds: distractingTime,
      insights
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/:userId/weekly
router.get('/:userId/weekly', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    const cutoff = sevenDaysAgo.toISOString().split('T')[0];

    const sessions = await TrackingSession.find({
      userId,
      date: { $gte: cutoff }
    }).sort({ date: 1 }).lean();

    // Aggregate site data across all days
    const aggregatedSites = {};
    let weeklyTotal = 0;

    sessions.forEach(session => {
      weeklyTotal += session.totalSeconds;
      session.siteData.forEach(({ domain, seconds }) => {
        aggregatedSites[domain] = (aggregatedSites[domain] || 0) + seconds;
      });
    });

    const topSites = Object.entries(aggregatedSites)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([domain, seconds]) => ({ domain, seconds, formatted: formatTime(seconds) }));

    // Daily breakdown
    const dailyBreakdown = sessions.map(s => {
      const distractingSites = ['youtube.com','reddit.com','twitter.com','x.com','tiktok.com'];
      const distractingTime = s.siteData
        .filter(sd => distractingSites.some(d => sd.domain.includes(d)))
        .reduce((acc, sd) => acc + sd.seconds, 0);
      return {
        date: s.date,
        totalSeconds: s.totalSeconds,
        formatted: formatTime(s.totalSeconds),
        productivityScore: s.totalSeconds > 0 
          ? Math.max(0, Math.round(100 - (distractingTime / s.totalSeconds) * 100)) 
          : 100
      };
    });

    const avgDailySeconds = sessions.length > 0 ? Math.floor(weeklyTotal / sessions.length) : 0;

    res.json({
      period: { from: cutoff, to: today.toISOString().split('T')[0] },
      weeklyTotalSeconds: weeklyTotal,
      weeklyTotalFormatted: formatTime(weeklyTotal),
      averageDailySeconds: avgDailySeconds,
      averageDailyFormatted: formatTime(avgDailySeconds),
      topSites,
      dailyBreakdown,
      activeDays: sessions.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Helpers ────────────────────────────────────────────────
function generateInsights(session) {
  const insights = [];
  const { totalSeconds, siteData } = session;

  if (totalSeconds > 28800) {
    insights.push({ type: 'warning', message: `You browsed for over 8 hours today. Consider taking breaks!` });
  }

  const distractingSites = ['youtube.com','reddit.com','twitter.com','facebook.com','instagram.com','tiktok.com'];
  const topDistractor = siteData
    .filter(s => distractingSites.some(d => s.domain.includes(d)))
    .sort((a, b) => b.seconds - a.seconds)[0];

  if (topDistractor && topDistractor.seconds > 3600) {
    insights.push({ 
      type: 'warning', 
      message: `You spent ${formatTime(topDistractor.seconds)} on ${topDistractor.domain}.`
    });
  }

  const topSite = [...siteData].sort((a, b) => b.seconds - a.seconds)[0];
  if (topSite) {
    insights.push({ 
      type: 'info', 
      message: `Most visited: ${topSite.domain} (${formatTime(topSite.seconds)})`
    });
  }

  return insights;
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

module.exports = router;
