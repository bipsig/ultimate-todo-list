import mongoose from "mongoose";

const itemSchema = mongoose.Schema ({
    item_name: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
});

const Item = mongoose.model ('Item', itemSchema);

export default Item;