const http = require("http");
const fs = require("fs");
const path = require("path");

const types = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".json": "application/json",
  ".css": "text/css"
};

http.createServer((req, res) => {
  let requestPath = req.url.split("?")[0];
  if (requestPath === "/") requestPath = "/index.html";
  const filePath = path.join(process.cwd(), requestPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("not found");
      return;
    }

    res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "text/plain" });
    res.end(data);
  });
}).listen(5173, "127.0.0.1", () => {
  console.log("GLITCH://PROTOCOL dev server: http://127.0.0.1:5173");
});
