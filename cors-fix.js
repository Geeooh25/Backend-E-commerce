const cors = require('cors'); 
 
const corsOptions = { 
    origin: [ 
        'https://beedahttreats.netlify.app', 
        'http://localhost:5500', 
        'http://127.0.0.1:5500' 
    ], 
    credentials: true, 
    optionsSuccessStatus: 200 
}; 
 
module.exports = corsOptions; 
