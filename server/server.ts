import express from "express";
import * as path from "path";
import compression from "compression";
import cookieParser from "cookie-parser";
import serveStatic from "serve-static";
import bodyParser from "body-parser";
import {RegisterGameEndpoints} from "./Games/GameEndpoints";
import {Config} from "./config/config";
import {CardManager} from "./Games/CardManager";
import {CreateGameManager} from "./Games/GameManager";

// Create the app
const app = express();
const port = Config.Port || 5000;
const clientFolder = path.join(process.cwd(), 'client');


// Set up basic settings
app.use(express.static(clientFolder, {
	cacheControl: true
}));
app.use(compression() as any);
app.use(cookieParser() as any);
app.use(bodyParser.json({
	type: ['application/json', 'text/plain']
}) as any);
app.use(bodyParser.urlencoded({extended: true}) as any);

app.get("/service-worker.js", (req, res) =>
{
	// Don't cache service worker is a best practice (otherwise clients wont get emergency bug fix)
	res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
	res.set("Content-Type", "application/javascript");
	serveStatic("/service-worker.js");
});

CardManager.initialize();
RegisterGameEndpoints(app, clientFolder);

// Start the server
const server = app.listen(port, () => console.log(`Listening on port ${port}`));
server.setTimeout(10000);

CreateGameManager(server);