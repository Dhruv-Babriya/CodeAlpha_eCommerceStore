const mongoose = require("mongoose");


const orderSchema = new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },


    orderItems:[

        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product"
            },

            name:String,

            qty:Number,

            price:Number,

            image:String
        }

    ],


    shippingAddress:{
        type:String,
        required:true
    },


    paymentMethod:{
        type:String,
        required:true
    },


    totalPrice:{
        type:Number,
        required:true
    },


    status:{
        type:String,
        default:"Pending"
    }


},
{
    timestamps:true
});


module.exports = mongoose.model("Order",orderSchema);