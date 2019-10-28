let express = require('express');
let morgan = require('morgan');
let uuid = require('uuid');

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

app.listen('8085', () => {
    console.log("app running on localhost:8085");
});