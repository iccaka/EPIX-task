import http from 'http';
const PORT = process.env.PORT;

const server = http.createServer((req, res) => {
    let result_msg = '';

    if(req.url === '/check-password-hash' && req.method === 'POST') {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({message: result_msg}));
        res.end();
    }
    else{
        result_msg = 'Not found!';

        res.writeHead(404, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({message: result_msg}));
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});