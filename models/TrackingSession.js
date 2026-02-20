const mongoose = require('mongoose');

const SiteEntrySchema = new mongoose.Schema({
  domain: { type: String, required: true },
  seconds: { type: Number, default: 0 }
}, { _id: false });

const TrackingSessionSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    index: true
  },
  date: { 
    type: String, // YYYY-MM-DD
    required: true,
    index: true
  },
  siteData: [SiteEntrySchema],
  totalSeconds: { type: Number, default: 0 },
  lastSynced: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

// Compound index for fast userId+date lookups
TrackingSessionSchema.index({ userId: 1, date: 1 }, { unique: true });

// Virtual: compute productivity score
TrackingSessionSchema.virtual('productivityScore').get(function() {
  const distractingSites = ['youtube.com','reddit.com','twitter.com','facebook.com',
    'instagram.com','tiktok.com','netflix.com','twitch.tv','x.com'];
  const total = this.totalSeconds;
  if (!total) return 100;
  const distractingTime = this.siteData
    .filter(s => distractingSites.some(d => s.domain.includes(d)))
    .reduce((acc, s) => acc + s.seconds, 0);
  return Math.max(0, Math.round(100 - (distractingTime / total) * 100));
});

TrackingSessionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('TrackingSession', TrackingSessionSchema);
