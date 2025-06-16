const mongoose = require('mongoose');

const solvedSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    username: { type: String, required: true,index: true },
    questionName: { type: String, required: true },
    topic: { type: String, required: true },
    subtopic: { type: String, default: '' },
    difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
    link: { type: String, default: '' },
    solvedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Solved', solvedSchema);