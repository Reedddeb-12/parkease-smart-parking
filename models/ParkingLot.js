const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  slotNumber: {
    type: String,
    required: true
  },
  isOccupied: {
    type: Boolean,
    default: false
  },
  vehicleType: {
    type: String,
    enum: ['car', 'bike', 'truck', 'any'],
    default: 'any'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  currentBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  }
});

const parkingLotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  totalSlots: {
    type: Number,
    required: true
  },
  availableSlots: {
    type: Number,
    required: true
  },
  slots: [parkingSlotSchema],
  pricePerHour: {
    type: Number,
    required: true
  },
  operatingHours: {
    open: {
      type: String,
      default: '00:00'
    },
    close: {
      type: String,
      default: '23:59'
    }
  },
  amenities: [{
    type: String,
    enum: ['security', 'covered', 'ev_charging', 'valet', 'cctv', 'lighting']
  }],
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  cctvFeeds: [{
    feedId: String,
    url: String,
    isActive: Boolean,
    lastDetection: Date
  }],
  predictedAvailability: {
    next1Hour: Number,
    next2Hours: Number,
    next4Hours: Number,
    lastUpdated: Date
  },
  analytics: {
    dailyRevenue: {
      type: Number,
      default: 0
    },
    monthlyRevenue: {
      type: Number,
      default: 0
    },
    occupancyRate: {
      type: Number,
      default: 0
    },
    averageStayDuration: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Create geospatial index
parkingLotSchema.index({ location: '2dsphere' });

// Update available slots count
parkingLotSchema.methods.updateAvailableSlots = function() {
  this.availableSlots = this.slots.filter(slot => !slot.isOccupied).length;
  return this.save();
};

module.exports = mongoose.models.ParkingLot || mongoose.model('ParkingLot', parkingLotSchema);