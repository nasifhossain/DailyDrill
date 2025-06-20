const express = require("express");
const User = require("../schema/User");
const router = express.Router();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const checkAuth = require("../authentication/checkAuth");
const JWT_SECRET = process.env.JWT_SECRET;
router.post("/login", async (req, res, next) => {
  try {
    var user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(400).json({ message: "Username does not exist" });
    }
    const checkPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!checkPassword) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const token = jwt.sign(
      { username: user.username, id: user._id },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    // console.log(token);
    res
      .status(200)
      .json({
        message: "Login Successful",
        username: user.username,
        id: user._id,
        token: token,
      });
  } catch (err) {
    res.status(500).json({ message: "Error in Login" });
    console.log("Error in login");
    //console.error(err);
  }
});

router.post("/signup", async (req, res, next) => {
  try {
    var existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: "Email Id Already exists" });
    }
    existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).json({ message: "Username Already exists" });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      name: req.body.name,
    });
    await user.save();
    res.status(201).json({ message: "User Registered Successfully" });
    console.log("User Registered Successfully");
  } catch (err) {
    res.status(500).json({ message: "Error in signup\n", error: err });
    console.log("Error in user registration\n");
    //console.error(err);
  }
});

router.post("/check", async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user) {
      res.status(400).json({ message: "Username Already Exists" });
    }
    res.status(200).json({ message: "Username Available" });
  } catch (error) {
    res.status(500).json({message:"Error checking Username"});
    console.log("Error Checking Username");
   // console.error(error);
    
    
  }
});

router.get("/:username",checkAuth,async (req,res,next)=>{
    try {
        const user =  await User.findOne({username:req.params.username});
        // console.log(user);
        
        if(!user)
        {
            res.status(404).json("No user found");
        }
        const userDetails = {
            id : user._id,
            username:user.username,
            email:user.email,
            name:user.name,
            codeforces:user.codeforces,
            leetcode:user.leetcode,
        }
       // console.log(userDetails);
        
        res.status(200).json({message:"User fetched successfully",userDetails});
    } catch (err) {
        res.status(500).json({message:"Error fetching account details"});
        console.log("Error fetching account details");
        
        //console.error(err);
        
    }
});

router.put('/update', checkAuth, async (req, res) => {
  const { name, email, codeforces, leetcode } = req.body;
  const userId = req.user._id;

  try {
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (codeforces) updateFields.codeforces = codeforces;
    if (leetcode) updateFields.leetcode = leetcode; // ✅ Add leetcode

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });

    res.status(200).json({ message: 'User updated successfully', updatedUser });
  } catch (err) {
    console.error("Error updating user", err);
    res.status(500).json({ message: "Error updating user" });
  }
});


module.exports = router;
