import http from 'http';
const PORT = process.env.PORT || 8080;

const isValidHexFormat = (hex) => {
  return typeof hex === 'string' && /^[a-fA-F0-9]{64}$/.test(hex);
};

const server = http.createServer((req, res) => {
    if(req.url === '/check-password-hash' && req.method === 'POST') {
        if(req.headers['content-type'] !== 'application/json') {
            res.writeHead(400, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify({message: 'Content-Type must be application/json!'}));
        }

        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {
           try {
               let jsonData = JSON.parse(body);

               if(!isValidHexFormat(jsonData.hex) || !jsonData || typeof jsonData !== 'object' || !jsonData.hasOwnProperty('hex')) {
                   res.writeHead(400, {'Content-Type': 'application/json'});
                   return res.end(JSON.stringify({message: 'Invalid JSON/hex format!'}));
               }

               res.writeHead(200, {'Content-Type': 'application/json'});
               res.end(JSON.stringify({message: 'Valid hex format!'}));
           }
           catch (error){
               res.writeHead(400, {'Content-Type': 'application/json'});
               return res.end(JSON.stringify({message: error.message}));
           }
        });

        req.on('error', () => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Error reading request body!' }));
        });
    }
    else{
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({message: 'Not found!'}));
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});