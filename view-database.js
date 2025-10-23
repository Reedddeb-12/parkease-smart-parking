/**
 * View MongoDB Database Contents
 */

require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./api/models/User');
const ParkingLot = require('./api/models/ParkingLot');
const Booking = require('./api/models/Booking');

async function viewDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');
        console.log('='.repeat(60));
        console.log('📊 PARKEASE DATABASE CONTENTS');
        console.log('='.repeat(60));

        // Get Users
        const users = await User.find({ userType: 'user' });
        const admins = await User.find({ userType: 'admin' });
        
        console.log(`\n👥 USERS (${users.length} total):`);
        console.log('-'.repeat(60));
        if (users.length === 0) {
            console.log('  No users found');
        } else {
            users.forEach((user, index) => {
                console.log(`\n  ${index + 1}. ${user.name}`);
                console.log(`     Email: ${user.email}`);
                console.log(`     Phone: ${user.phone || 'N/A'}`);
                console.log(`     Type: ${user.userType}`);
                console.log(`     Joined: ${user.createdAt.toLocaleDateString()}`);
            });
        }

        console.log(`\n\n👨‍💼 ADMINS (${admins.length} total):`);
        console.log('-'.repeat(60));
        if (admins.length === 0) {
            console.log('  No admins found');
        } else {
            admins.forEach((admin, index) => {
                console.log(`\n  ${index + 1}. ${admin.name}`);
                console.log(`     Email: ${admin.email}`);
                console.log(`     Phone: ${admin.phone || 'N/A'}`);
                console.log(`     Type: ${admin.userType}`);
                console.log(`     Joined: ${admin.createdAt.toLocaleDateString()}`);
            });
        }

        // Get Parking Lots
        const parkingLots = await ParkingLot.find({});
        console.log(`\n\n🅿️  PARKING LOTS (${parkingLots.length} total):`);
        console.log('-'.repeat(60));
        if (parkingLots.length === 0) {
            console.log('  No parking lots found');
        } else {
            parkingLots.forEach((lot, index) => {
                console.log(`\n  ${index + 1}. ${lot.name}`);
                console.log(`     Address: ${lot.address}`);
                console.log(`     Location: [${lot.location.coordinates[1]}, ${lot.location.coordinates[0]}]`);
                console.log(`     Slots: ${lot.availableSlots}/${lot.totalSlots} available`);
                console.log(`     Price: ₹${lot.pricePerHour}/hour`);
                console.log(`     Status: ${lot.isActive ? 'Active' : 'Inactive'}`);
                console.log(`     Revenue: ₹${lot.totalRevenue}`);
            });
        }

        // Get Bookings
        const bookings = await Booking.find({}).populate('parkingLot', 'name address');
        console.log(`\n\n📅 BOOKINGS (${bookings.length} total):`);
        console.log('-'.repeat(60));
        if (bookings.length === 0) {
            console.log('  No bookings found');
        } else {
            bookings.forEach((booking, index) => {
                console.log(`\n  ${index + 1}. Booking #${booking.bookingId}`);
                console.log(`     Parking: ${booking.parkingLot?.name || 'N/A'}`);
                console.log(`     Vehicle: ${booking.vehicle.name} (${booking.vehicle.number})`);
                console.log(`     Duration: ${booking.duration} hours`);
                console.log(`     Amount: ₹${booking.amount}`);
                console.log(`     Status: ${booking.status}`);
                console.log(`     Date: ${booking.createdAt.toLocaleDateString()}`);
            });
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 SUMMARY:');
        console.log(`   Total Users: ${users.length}`);
        console.log(`   Total Admins: ${admins.length}`);
        console.log(`   Total Parking Lots: ${parkingLots.length}`);
        console.log(`   Total Bookings: ${bookings.length}`);
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
    }
}

viewDatabase();
