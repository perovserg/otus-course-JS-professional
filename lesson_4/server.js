const path = require('path');
const fs = require('fs');
const http = require('http');

let file;
fs.readFile(path.join(__dirname, 'index.html'), (error, result) => {
    if (error) throw error;
    file = result.toString();
    console.log(file)
});

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end(file);
});

const hostname = '127.0.0.1'
const port = 3000;

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});
