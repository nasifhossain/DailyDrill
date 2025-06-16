const express  = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const MONGO_URI = process.env.MONGO_URI;
const userRoutes = require('./routes/User')
const app = express();
const solvedRoutes = require('./routes/Solved');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

mongoose.connect(MONGO_URI);
mongoose.connection.on("error",(err)=>{
    console.log("Error Connecting to MONGO DB");
    console.error(err);
    
})
mongoose.connection.on("connected",()=>{
    console.log("Connected to MONGO DB");
    
})

app.use('/user',userRoutes);
app.use('/solved', solvedRoutes);

app.use((req, res, next) => {
  res.status(200).json({ message: "app is running" });
});

module.exports = app;