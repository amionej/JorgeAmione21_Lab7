function fetchPosts(){
    $("#blog-posts").html('');
    var req = new Request('/blog-posts');
    fetch(req)
    .then(function(response){
        if(response.ok){
            return response.json();
        }
        throw new Error (response.statusText + " Something went wrong")

    })
    .then(function(responseJSON){
        console.log(responseJSON);
        let blogposts = responseJSON.blogposts;
        blogposts.map((post) => {
            $("#blog-posts").append(
                `<li class = "listitem">
                <p>id: ${post.id === undefined ? 'no id' : post.id} </p>
                <p>Title: ${post.title === undefined ? 'no title' : post.title} </p>
                <p>Content: ${post.content === undefined ? 'no content' : post.content} </p>
                <p>Author: ${post.author === undefined ? 'no author' : post.author} </p>
                <p>Publish Date: ${post.publishDate === undefined ? 'no publish date' : post.publishDate} </p>
                </li>
                `
            );
        })
    })
    .catch(function(err){
        console.log(err);
    });
}


$(document).ready(function() {
    fetchPosts();

    $("#newButton").on("click", function(e) {
        e.preventDefault();
        var today = new Date();
        fetch('/blog-posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: $("#NewTitle").val(),
                content: String($("#NewContent").val()),
                author: String($("#NewAuthor").val()),
                publishDate: String(today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate())
            })
        })
        .then(function(response){

            if(response.ok){
                return response.json();
            }
            throw new Error (response.statusText + " Something went wrong")

        }) 
        .then(function(responseJSON){
            console.log(responseJSON);
            fetchPosts();
        })
        .catch(function(err){
            console.log(err);
        });
    });

    $("#deleteButton").on("click", function(e) {
        e.preventDefault();
        const idparam= $("#deleteInput").val()
        console.log(idparam)
        fetch(`/blog-posts/${idparam}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: idparam,
            })
        })
        .then(function(response){
            if(response.ok){
                return response.json();
            }
            throw new Error (response.statusText + " Something went wrong")

        }) 
        .then(function(responseJSON){
            console.log(responseJSON);
            fetchPosts();
        })
        .catch(function(err){
            console.log(err);
        });

    });

    $("#updateButton").on("click", function(e) {
        e.preventDefault();
        const idparam= $("#idToUpdate").val()
        const titlee = $("#UpdateTitle").val() ? $("#UpdateTitle").val() : undefined
        const contentt = $("#UpdateContent").val() ? $("#UpdateContent").val() : undefined
        const authorr = $("#UpdateAuthor").val() ? $("#UpdateAuthor").val() : undefined
        const pd= $("#publishedDateInput").val() ? $("#publishedDateInput").val() : undefined
        fetch(`/blog-posts/${idparam}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: idparam,
                title: titlee,
                content: contentt,
                author: authorr,
                publishDate: pd
            })
        })
        .then(function(response){

            if(response.ok){
                return response.json();
            }
            throw new Error (response.statusText + " Something went wrong")

        }) 
        .then(function(responseJSON){
            console.log(responseJSON);
            fetchPosts();
        })
        .catch(function(err){
            console.log(err);
        });
    });
});