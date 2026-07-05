import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  subscribers: {
    type: mongoose.Schema.Types.ObjectId,     // user who is subscribing
    ref: "User",
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,     // channel to whom user is subscribing
    ref: "User",
  },
}, {timestamps:true});


const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
