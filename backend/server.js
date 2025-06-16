const http = require("http");
const app = require("./app");
const { log } = require("console");
const PORT = 3000;

const server = http.createServer(app);
server.listen(PORT,()=>{
    console.log(`App is running on port ${PORT}`);
    
})