import mongoose from "mongoose";

const listSchema = new mongoose.Schema({
    list_name: {
        type: String,
        required: true
    },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }]
});

const List = mongoose.model ('List', listSchema);

export default List;