const mongoose = require('mongoose');

const UserSettingsSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  blockedDomains: [{ type: String }],
  productiveCategories: [{ type: String }],
  dailyGoalHours: { type: Number, default: 8 },
  notificationsEnabled: { type: Boolean, default: true },
  reportTime: { type: String, default: '23:59' },
  timezone: { type: String, default: 'UTC' }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('UserSettings', UserSettingsSchema);
