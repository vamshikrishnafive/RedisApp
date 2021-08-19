const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const methodeOverride = require('method-override');
const redis = require('redis');

//create redis client
let client = redis.createClient();
client.on('connect', function() {
    console.log('connected to client')
});
client.on('error', function(err) {
    console.error('error in connection' + err)
});

const app = express()
const port = 3000

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodeOverride('_method'));

app.get('/', (req, res,next)  => {
    res.render('searchusers');
});

app.post('/user/search', (req,res,next) => {
    let id = req.body.id
    client.hgetall(id, (err, user) => {
        if(!user) {
            res.render('searchusers', { error: 'User dose not found' });
        } else {
            user.id = id;
            res.render('details', { user })
        }
    })
})

app.get('/user/add', (req, res,next)  => {
    res.render('adduser')
});

app.post('/user/add', (req, res, next) => {
    let id = req.body.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;

    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone,
    ], (err, reply) => {
        if(err) {
            console.error(err);
        } console.log(reply)
        res.redirect('/')
    })
})

app.delete('/user/delete/:id', (req, res, next) => {
    client.del(req.params.id);
    res.redirect('/')
})

app.listen(port, () => console.log(`app listening on port ${port}`))