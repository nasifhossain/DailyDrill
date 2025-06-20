const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    username:{type: String, required:true},
    password:{type:String,required:true},
    email:{type:String,required:true},
    name:{type:String},
    codeforces:{type:String},
    leetcode:{type:String},
})
module.exports = mongoose.model("User",userSchema);