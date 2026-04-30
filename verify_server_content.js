const http = require('http');

http.get('http://localhost:3000', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        if (data.includes('<svg')) {
            console.log('SUCCESS: Server is serving the SVG logo.');
        } else if (data.includes('🤖')) {
            console.log('FAILURE: Server is serving the old Robot Emoji.');
        } else {
            console.log('UNKNOWN: Could not find either logo.');
            console.log('Snippet:', data.substring(900, 1500));
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
