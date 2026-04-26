import mongoose from "mongoose";

const followSchema = mongoose.Schema({
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    followingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true })

// Prevents same user following a user twice — at database level
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export default mongoose.model('Follow', followSchema)