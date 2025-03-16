import http from 'http';
import https from 'https';
import crypto from 'crypto';
import {parseString} from 'xml2js';

const PORT = process.env.PORT || 8000;

const isValidHexFormat = (hex) => {
    return typeof hex === 'string' && /^[a-fA-F0-9]{64}$/.test(hex);
};

const fetchData = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                resolve(body);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
};

const hashPassword = (password, salt) => {
    return crypto.createHash('sha256').update(password + salt).digest('hex');
};

const server = http.createServer((req, res) => {
    if (req.url === '/check-password-hash' && req.method === 'POST') {
        if (req.headers['content-type'] !== 'application/json') {
            res.writeHead(400, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify({message: 'Content-Type must be application/json!'}));
        }

        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', async () => {
            try {
                let jsonData = JSON.parse(body);

                if (!isValidHexFormat(jsonData.hex) || !jsonData || typeof jsonData !== 'object' || !jsonData.hasOwnProperty('hex')) {
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    return res.end(JSON.stringify({message: 'Invalid JSON/hex format!'}));
                }

                const saltXml = await fetchData('https://testapi.refractionx.com/salt.xml');
                let salt;

                parseString(saltXml, (error, result) => {
                    if (error || !result.testdata || !result.testdata.salt) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ message: 'Failed to fetch salt!' }));
                    } else {
                        salt = result.testdata.salt[0];
                    }
                });

                const jsonPass = await fetchData('https://testapi.refractionx.com/password.json');
                const objPass = JSON.parse(jsonPass);
                const pass = objPass.value;

                if(!pass){
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Failed to fetch password!' }));
                }

                const computedHash = hashPassword(pass, salt);

                if(computedHash === jsonData.hex){
                    res.writeHead(204, { 'Content-Type': 'application/json' });
                    res.end();
                }
                else{
                    res.writeHead(401, {'Content-Type': 'application/json'});
                    return res.end(JSON.stringify({message: 'Invalid password hash!'}));
                }
            } catch (error) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                return res.end(JSON.stringify({message: error.message}));
            }
        });

        req.on('error', () => {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({message: 'Error reading request body!'}));
        });
    }
else
    {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({message: 'Not found!'}));
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});