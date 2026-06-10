const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const options = {
    key: fs.readFileSync(path.join(__dirname, 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
};

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

const server = https.createServer(options, (req, res) => {
    // Serve HTML
    if ((req.url === '/' || req.url === '/index.html') && req.method === "GET") {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end("Error: File not found");
            } else {
                res.end(data);
            }
        });
        return;
    }

    // Serve static files (CSS, JS)
    if (req.url.startsWith('/public/') && req.method === "GET") {
        const filePath = path.join(__dirname, req.url);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end("Not found");
                return;
            }
            const ext = path.extname(filePath);
            const contentType = ext === '.css' ? 'text/css' : ext === '.js' ? 'text/javascript' : 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
        return;
    }

    // API endpoint
    if (req.url === '/api/data/np2belumsp2' && req.method === 'POST') {
        let requestBody = '';

        req.on('data', (chunk) => { requestBody += chunk; });

        req.on('end', () => {
            const myHeaders = {
                "Authorization": "Bearer b0555476-8a85-4e2d-b539-dcf201d673ff",
                "Content-Type": "application/json",
                "Accept": "application/json, text/javascript, */*; q=0.01"
            };

            let cookieValue = requestBody.trim();

            if (cookieValue.toLowerCase().startsWith('cookie:')) {
                cookieValue = cookieValue.split(/:\s*/).slice(1).join(':');
            }

            cookieValue = cookieValue.replace(/[\r\n]+/g, '; ').trim();

            if (cookieValue) {
                myHeaders.Cookie = cookieValue;
            }

            const apiUrl = "https://portalp2.intranet.pajak.go.id/ekin/getDetail?tahun=2026&bulan=1&bulanAkhir=12&unit=072&level=3&url=np2belumsp2&jenis=1";
            
            const parsedUrl = new url.URL(apiUrl);
            
            const requestOptions = {
                hostname: parsedUrl.hostname,
                port: 443,
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'GET',
                headers: myHeaders,
                agent: httpsAgent
            };
            
            const apiReq = https.request(requestOptions, (apiRes) => {
                let data = '';

                apiRes.on('data', (chunk) => {
                    data += chunk;
                });

                apiRes.on('end', () => {
                    // console.log("SERVER API Response:", data);
                    res.writeHead(apiRes.statusCode || 200, { 'Content-Type': 'application/json' });
                    res.end(data);
                });

                apiRes.on('error', (error) => {
                    console.error("SERVER API Response Error:", error.message);
                    res.writeHead(502, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: error.message }));
                });
            });
            
            apiReq.on('error', (error) => {
                console.error("SERVER API Error:", error.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            });
            
            apiReq.end();
        });

        req.on('error', (error) => {
            console.error("SERVER Request error:", error.message);

            res.writeHead(500, { 'Content-Type': 'application/json' });

            res.end(JSON.stringify({ error: error.message }));
        });

        return;
    }

    if (req.url === '/api/data/sp2belumlhp' && req.method === 'POST') {
        let requestBody = '';

        req.on('data', (chunk) => { requestBody += chunk; });

        req.on('end', () => {
            const myHeaders = {
                "Authorization": "Bearer b0555476-8a85-4e2d-b539-dcf201d673ff",
                "Content-Type": "application/json",
                "Accept": "application/json, text/javascript, */*; q=0.01"
            };

            let cookieValue = requestBody.trim();

            if (cookieValue.toLowerCase().startsWith('cookie:')) {
                cookieValue = cookieValue.split(/:\s*/).slice(1).join(':');
            }

            cookieValue = cookieValue.replace(/[\r\n]+/g, '; ').trim();

            if (cookieValue) {
                myHeaders.Cookie = cookieValue;
            }

            const apiUrl = "https://portalp2.intranet.pajak.go.id/ekin/getDetail?tahun=2026&bulan=1&bulanAkhir=12&unit=072&level=3&url=sp2belumlhp&jenis=1";
            
            const parsedUrl = new url.URL(apiUrl);
            
            const requestOptions = {
                hostname: parsedUrl.hostname,
                port: 443,
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'GET',
                headers: myHeaders,
                agent: httpsAgent
            };
            
            const apiReq = https.request(requestOptions, (apiRes) => {
                let data = '';

                apiRes.on('data', (chunk) => {
                    data += chunk;
                });

                apiRes.on('end', () => {
                    console.log("SERVER API Response:", data);
                    res.writeHead(apiRes.statusCode || 200, { 'Content-Type': 'application/json' });
                    res.end(data);
                });

                apiRes.on('error', (error) => {
                    console.error("SERVER API Response Error:", error.message);
                    res.writeHead(502, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: error.message }));
                });
            });
            
            apiReq.on('error', (error) => {
                console.error("SERVER API Error:", error.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            });
            
            apiReq.end();
        });

        req.on('error', (error) => {
            console.error("SERVER Request error:", error.message);

            res.writeHead(500, { 'Content-Type': 'application/json' });

            res.end(JSON.stringify({ error: error.message }));
        });

        return;
    }
    // 404 for everything else
    res.writeHead(404);
    res.end("Not found");
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Secure server is running at https://localhost:${PORT}`);
});