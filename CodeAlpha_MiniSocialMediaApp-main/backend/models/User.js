const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({

    username:{
        type:String,
        required:true,
        unique:true
    },


    email:{
        type:String,
        required:true,
        unique:true
    },


    password:{
        type:String,
        required:true
    },


    bio:{
        type:String,
        default:"Hello! I am new here."
    },


    profileImage:{
        type:String,
        default:"default.png"
    },


    coverImage:{
        type:String,
        default:""
    },


    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],


    following:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ]


},
{
    timestamps:true
});


module.exports = mongoose.model("User",userSchema);