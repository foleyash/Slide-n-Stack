
import express from 'express'
const app = express()

app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

app.post('/api', (req, res) => {
    console.log(req.body);
    res.json({
        status: "success",
        level: req.body.level,
        extraBlocks: req.body.extraBlocks
    });
});

app.get('/', (req, res) => {
    console.log('Home page');
    res.render("/public/index.html");
    next();
});


app.listen(3000)