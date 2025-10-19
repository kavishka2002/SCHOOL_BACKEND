import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    orderId : {
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required : true
    },
    name : {
        type : String,
        required : true
    },
    address : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true
    },
    date : {
        type : Date,
        default : Date.now()
    },
    status : {
        type : String,
        default : "pending"
    },
    items :[
            {
                productId : {
                    type : String,
                    required : true
                },
                name : {
                    type : String,
                    required : true
                },
                image : {
                    type : String,
                    required : false
                },
                price : {
                    type : Number,
                    required : true
                },
                qty : {
                    type : Number,
                    required : true
                },
                
            }
        ],
    note : {
        type : String,
        default : "No addional Notes"
    },
    total : {
        type : Number,
        required : true,
        default : 0
    }


    
    

})

const Order = mongoose.model("orders",orderSchema)
export default Order;