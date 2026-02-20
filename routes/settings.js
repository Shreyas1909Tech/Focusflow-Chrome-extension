const express = require('express');
const router = express.Router();
const UserSettings = require('../models/UserSettings');

// GET /api/settings/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let settings = await UserSettings.findOne({ userId });
    
    if (!settings) {
      // Create default settings for new user
      settings = await UserSettings.create({ 
        userId,
        blockedDomains: [],
        productiveCategories: ['github.com', 'stackoverflow.com', 'docs.google.com']
      });
    }

    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings/:userId
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { blockedDomains, productiveCategories, dailyGoalHours, notificationsEnabled } = req.body;

    const updateData = {};
    if (blockedDomains !== undefined) updateData.blockedDomains = blockedDomains;
    if (productiveCategories !== undefined) updateData.productiveCategories = productiveCategories;
    if (dailyGoalHours !== undefined) updateData.dailyGoalHours = dailyGoalHours;
    if (notificationsEnabled !== undefined) updateData.notificationsEnabled = notificationsEnabled;

    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings/:userId/block
router.post('/:userId/block', async (req, res) => {
  try {
    const { userId } = req.params;
    const { domain } = req.body;

    if (!domain) return res.status(400).json({ error: 'Domain is required' });

    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $addToSet: { blockedDomains: domain.toLowerCase() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, blockedDomains: settings.blockedDomains });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/settings/:userId/block/:domain
router.delete('/:userId/block/:domain', async (req, res) => {
  try {
    const { userId, domain } = req.params;

    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $pull: { blockedDomains: decodeURIComponent(domain) } },
      { new: true }
    );

    if (!settings) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, blockedDomains: settings.blockedDomains });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
