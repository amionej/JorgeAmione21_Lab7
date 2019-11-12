let mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let ownerSchema = mongoose.Schema({
    id: {type: Number, required: true}
});

let Owner = mongoose.model("Owner", ownerSchema);

let petSchema = mongoose.Schema({
    name: {type: String},
    typeOfPet: {type: String},
    id: {type: Number,
        required: true,
    },
    //owner: {type: mongoose.Schema.Types.ObjectId,
    //      ref: "Owner"
    //}
});

let Pet = mongoose.model('Pet', petSchema);
let PetList = {
    //everything should already be validated by now
    post: function(newPet){
        return Pet.create(newPet)
            .then( pet => {//once it is finally created
                return pet;
            })
            .catch(err => {//if something goes wrong w/ the databae
                throw Error(err);
            });
    },
    getAll: function(){
        return Pet.find()
            .then( pet => {
                return pet;
            })
            .catch(err => {
                throw Error(err);
            })
    },
    getById: function(id){
        return Pet.findOne({id: id})
            .then( pet => {
                return pet;
            })
            .catch(err => {
                throw Error(err);
            })
    },
    put: function(id, updatedObj){
        return Pet.findOneAndUpdate({id: id}, {$set: {"name":updatedObj.name, "typeOfPet":updatedObj.typeOfPet,}}, {new: true})
            .then( pet => {
                return pet;
            })
            .catch(err => {
                throw Error(err);
            })
    },
    delete: function(id){
        return Pet.findOneAndRemove({id: id})
            .then( pet => {
                return pet;
            })
            .catch(err => {
                throw Error(err);
            })
    },

}

module.exports = { PetList };