let express = require('express');
let morgan = require('morgan');
let uuid = require('uuid');
let mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let { PetList } = require('./module.js');
let{ DATABASE_URL, PORT } = require('./config');

let app = express();

let bodyParser = require ('body-parser')
let jsonParser = bodyParser.json();

app.use(express.static('public'));
app.use( morgan( 'dev' ));

var today = new Date();

let blogposts = [
    {
        id: 1,
        title: 'hello',
        content: '1x1=1',
        author: 'Jorge',
        publishDate: today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate(),
    },
    {
        id: 2,
        title: 'goodbye',
        content: '2x2=4',
        author: 'Maria',
        publishDate: today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate(),
    },
    {
        id: 3,
        title: 'hasta pronto',
        content: '3x3=9',
        author: 'Jose',
        publishDate: today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate(),
    },
];

// ID IN BODY BEING NUMBER TYPE MAY CAUSE PROBLEMS WHEN REQUESTING IN POSTMAN

app.get('/blog-posts', (req, res) => {
    return res.status(200).json({
        blogposts,
    })
})

app.get('/blog-post', (req, res) => {
    if (req.query.author === undefined){
        return res.status(406).json({
            code: 406,
            message : "Missing author query",
        })
    }
    let authorBlogPosts = [];
    for (let i = 0; i< blogposts.length; i++){
        if (blogposts[i].author === req.query.author){
            authorBlogPosts.push(blogposts[i]);
        }
    }
    if (authorBlogPosts.length > 0){
        return res.status(200).json( authorBlogPosts );
    }
    return res.status(400).json({
        code: 404,
        message : "Author not found",
    })
})

app.post('/blog-posts', jsonParser, (req, res) => {

        if(!req.body.title) {
            return res.status(406).send({
              success: 'false',
              message: 'title is required'
            });
          } 
        else if(!req.body.content) {
            return res.status(406).send({
              success: 'false',
              message: 'content is required'
            });
        }
        else if(!req.body.author) {
            return res.status(406).send({
              success: 'false',
              message: 'author is required'
            });
        }
        else if(!req.body.publishDate) {
            return res.status(406).send({
              success: 'false',
              message: 'publishDate is required'
            });
        }
        let temp = {
            id: uuid.v4(),
            title: req.body.title,
            content: req.body.content,
            author: req.body.author,
            publishDate: req.body.publishDate,
        };
        blogposts.push(temp);
        return res.status(201).send({
            success: 'true',
            message: 'Post added succesfully',
            blogposts
          })
    })

app.delete('/blog-posts/:id', (req, res) => {
    for (let i = 0; i< blogposts.length; i++){
        console.log(req.params.id)
        console.log(blogposts[i].id)
        if (String(blogposts[i].id) === req.params.id){
            blogposts.splice(i,1);
            return res.status(200).json({
                success: 'true',
                message: 'Post  deleted successfully',
              })
        }
    }
    return res.status(404).json({
        code: 404,
        message : "Post not found",
    })
})
app.put('/blog-posts/:id', jsonParser, (req, res) => {
    if(!req.body.id) {
        return res.status(406).send({
            success: 'false',
            message: 'id in body is required'
          });
    }
    else if (req.body.id !== req.params.id){
        return res.status(409).send({
            success: 'false',
            message: 'id in body is not equivalent to id in path'
          });
    }
    for (let i = 0; i< blogposts.length; i++){
        if (String(blogposts[i].id) === req.params.id){
            if(req.body.title) {
                blogposts[i].title=req.body.title;
            } 
            if(req.body.content) {
                blogposts[i].content=req.body.content;
            }
            if(req.body.author) {
                blogposts[i].author=req.body.author;
            }
            if(req.body.publishDate) {
                blogposts[i].publishDate=req.body.publishDate;
            }
            postUpdated=blogposts[i]
            return res.status(202).json({
                success: 'true',
                message: 'Post updated successfully',
                postUpdated
              })
        }
    }
    return res.status(404).json({
        code: 404,
        message : `Post with id ${req.body.id} does not exist`,
    })
})

//MONGOOSE CLASS

app.post('/api/postPet', jsonParser, (req, res, next) => {
    let {name, typeOfPet, id} = req.body;

    if(!name || !typeOfPet || !id ){
        res.statusMessage = "Missing field in body";
        return res.status(406).json({
            message: "Missing field in body",
            status: 406
        });
    }
    
    let newPet = {
        name, typeOfPet, id
    };
    //VALIDATE ID IWTH A GET BY ID
    PetList.getById(id)
        .then(pet => {
            if (pet){
                return res.status(406).json({
                    message: "Repeated Pet ID",
                    status: 406
                });
            }
            else{
                //POST IT
                PetList.post(newPet)//it is a promise, so there goes a .then()
                .then(postedPet => {
                    return res.status(201).json(postedPet);
                })
                .catch(err => {
                    res.statusMessage = "Something went wrong with the DB";
                    return res.status(500).json({
                        message: "Something went wrong with the DB",
                        status: 500
                    });
                 });
            }
        })
        .catch(err => {
            res.statusMessage = "Something went wrong with the DB";
            return res.status(500).json({
                message: "Something went wrong with the DB",
                status: 500
            });
        });
});

app.get('/api/getPet/:id', (req, res, next) => {

    PetList.getById(req.params.id)
        .then(pet => {
            return res.status(201).json(pet);
        })
        .catch(err => {
            res.statusMessage = "Something went wrong with the DB";
            return res.status(500).json({
                message: "Something went wrong with the DB",
                status: 500
            });
        });
});

app.get('/api/getAllPets', (req, res, next) => {
    PetList.getAll()
        .then(pet => {
            return res.status(201).json(pet);
        })
        .catch(err => {
            res.statusMessage = "Something went wrong with the DB";
            return res.status(500).json({
                message: "Something went wrong with the DB",
                status: 500
            });
        });
});

app.put('/api/updatePet', jsonParser, (req, res, next) => {
    let {name, typeOfPet, id} = req.body;

    if(!name || !typeOfPet || !id ){
        res.statusMessage = "Missing field in body";
        return res.status(406).json({
            message: "Missing field in body",
            status: 406
        });
    }

    let newPet = {
        name, typeOfPet, id
    };

    PetList.getById(id)
        .then(pet => {
            if (pet){
                PetList.put(id, newPet)
                    .then(updatedPet => {
                        return res.status(201).json(updatedPet);
                    })
                    .catch(err => {
                        res.statusMessage = "Something went wrong with the DB";
                        return res.status(500).json({
                            message: "Something went wrong with the DB",
                            status: 500
                        });
                    });
            }
            else{
                return res.status(406).json({
                    message: "No pet with such ID",
                    status: 406
                });
            }
        })
        .catch(err => {
            res.statusMessage = "Something went wrong with the DB";
            return res.status(500).json({
                message: "Something went wrong with the DB",
                status: 500
            });
        });
});

app.delete('/api/deletePet/:id', (req, res, next) => {

    //Validate ID

    PetList.delete(req.params.id)
        .then(pet => {
            return res.status(201).json(pet);
        })
        .catch(err => {
            res.statusMessage = "Something went wrong with the DB";
            return res.status(500).json({
                message: "Something went wrong with the DB",
                status: 500
            });
        });
});

// app.listen('8085', () => {
//     console.log("app running on localhost:8085");
// }); This is replaced by the following code snippet"

function runServer(port, databaseUrl){
    return new Promise( (resolve, reject ) => {
        mongoose.connect(databaseUrl, response => {
            if ( response ){
                return reject(response);
            }
            else {
                server = app.listen(port, () => {
                    console.log( "App is running on port " + port );
                    resolve();
                })
                .on( 'error', err => {
                    mongoose.disconnect();
                    return reject(err);
                })
            }
        });
    });
}

function closeServer(){
    return mongoose.disconnect()
    .then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing the server');
            server.close( err => {
                if (err){
                    return reject(err);
                }
                else{
                    resolve();
                }
            });
        });
    });
}
   
runServer( PORT, DATABASE_URL )
    .catch( err => {
        console.log( err );
    });
   
   module.exports = { app, runServer, closeServer };