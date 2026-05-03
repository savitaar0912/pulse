import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, //stores the reference
        ref: 'User',                          // tells Mongoose which model to link
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 300,
        trim: true
    },
    imageUrl: {
        type: String,
        default: ' '
    },
    imagePublicId: {
        type: String,
        default: ' '
    },
    likesCount: {
        type: Number,
        default: 0
    },
    commentsCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

export default mongoose.model('Post', postSchema);