const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
const opts={toJSON:{virtuals:true}};
const ImageSchema=new Schema({
    
        url: String,
        filename: String
    
})
ImageSchema.virtual('thumbnail').get(function(){
 return this.url.replace('/upload','/upload/w_200');
})
const campGround = new Schema({
    name: String,
    price: Number,
    images: [
        ImageSchema
    ],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    
},opts);
campGround.virtual('properties.popUpMarkup').get(function(){
return `<a href ="/campgrounds/${this._id}">${this.name}</a>`;
});
campGround.post('findOneAndDelete', async function (doc) {
    //console.log(doc);
    if (doc) {
        await Review.remove({
            _id: {
                $in: doc.reviews
            }
        });
    }
})
module.exports = mongoose.model('CampGround', campGround);
