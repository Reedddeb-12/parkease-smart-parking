const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parkingLot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: true
  },
  slotNumber: {
    type: String,
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true
  },
  vehicleType: {
    type: String,
    enum: ['car', 'bike', 'truck'],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'expired'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  qrCode: {
    type: String
  },
  entryValidated: {
    type: Boolean,
    default: false
  },
  exitValidated: {
    type: Boolean,
    default: false
  },
  notifications: {
    reminderSent: {
      type: Boolean,
      default: false
    },
    expiryWarningSent: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Auto-expire bookings
bookingSchema.methods.checkExpiry = function() {
  if (this.status === 'confirmed' && new Date() > this.endTime) {
    this.status = 'expired';
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('Booking', bookingSchema);