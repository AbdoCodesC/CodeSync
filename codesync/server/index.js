import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("code-change", (code) => {
    socket.broadcast.emit("code-update", code);
  });

  socket.on("run-code", (code) => {
    const tempFile = path.join(__dirname, "temp.js");

    try {
      // Write the code to temp file
      fs.writeFileSync(tempFile, code);

      // Execute the code
      exec(`node ${tempFile}`, (error, stdout, stderr) => {
        let output = stdout;
        if (error) {
          output = stderr;
        }

        io.emit("output-update", output);

        // Clean up temp file
        try {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
        } catch (cleanupError) {
          console.error("Error cleaning up temp file:", cleanupError);
        }
      });
    } catch (error) {
      console.error("Error running code:", error);
      io.emit("output-update", `Error: ${error.message}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

httpServer.listen(3001, () => {
  console.log("Server running on port 3001");
});
