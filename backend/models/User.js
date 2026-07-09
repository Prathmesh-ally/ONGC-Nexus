import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['MasterAdmin', 'Uploader', 'Normal'], 
        default: 'Normal' 
    }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;