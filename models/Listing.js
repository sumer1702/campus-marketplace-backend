
const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  location: { type: String, required: true },
  seller: {
    username: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    uid: { type: String, required: true },
  },
  category: { type: String, enum: ['Sale', 'Rent', 'Time Exchange'], required: true },
  status: { type: String, enum: ['Active', 'Closed', 'Delisted'], default: 'Active' },
  interested: [
    {
      userId: String,
      offerPrice: Number,
      comment: String,
      timestamp: { type: Date, default: Date.now },
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Listing', ListingSchema);
