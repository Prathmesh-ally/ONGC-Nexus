import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/User.js'; 

dotenv.config();

const seedMasterAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to local database...");

        await User.deleteMany({});
        const adminExists = await User.findOne({ role: 'MasterAdmin' });
        if (adminExists) {
            console.log("Alert: Master Admin already exists! Aborting script.");
            process.exit();
        }

        const plainTextPassword = "ONGC_Admin_2026!";
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);

        const masterAdmin = new User({
            username: "admin",
            password: hashedPassword,
            role: "MasterAdmin"
        });

        await masterAdmin.save();
        console.log(" SUCCESS: Master Admin account created securely.");
        console.log("Username: admin");
        
        process.exit(0); 
    } catch (error) {
        console.error("Alert,Error seeding admin:", error);
        process.exit(1); 
    }
};

seedMasterAdmin();
