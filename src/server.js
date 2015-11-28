import koa from "koa";
import proxy from "koa-proxy";
import serve from "koa-static";

import React from "react";
import ReactDOM from "react-dom/server";
import {RoutingContext, match} from "react-router";
import {createLocation} from "history";
import Transmit from "react-transmit";
import socketio from 'socket.io';
import routes from "views/routes";

const app      = koa();
const hostname = process.env.HOSTNAME || "localhost";
const port     = process.env.PORT || 8000;

app.use(serve("static", {defer: true}));

app.use(proxy({
	host: "https://api.github.com",
	match: /^\/api\/github\//i,
	map: (path) => path.replace(/^\/api\/github\//i, "/")
}));

app.use(function *(next) {
	const location = createLocation(this.path);
	const webserver = process.env.NODE_ENV === "production" ? "" : "//" + hostname + ":8080";

	yield ((callback) => {
		match({routes, location}, (error, redirectLocation, renderProps) => {
			if (redirectLocation) {
				this.redirect(redirectLocation.pathname + redirectLocation.search, "/");
				return;
			}

			if (error || !renderProps) {
				callback(error);
				return;
			}

			Transmit.renderToString(RoutingContext, renderProps).then(({reactString, reactData}) => {
				let template = (
						`<!doctype html>
					<html lang="en-us">
						<head>
							<meta charset="utf-8">
							<title>react-isomorphic-starterkit</title>
							<link rel="shortcut icon" href="/favicon.ico">
							<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
							<script type="text/javascript" src="/libs/jquery.event.drag-2.0.js"></script>
							<script src="https://cdn.socket.io/socket.io-1.3.7.js"></script>
						</head>
						<body>
							<div id="react-root">${reactString}</div>
						</body>
					</html>`
				);

				this.type = "text/html";
				this.body = Transmit.injectIntoMarkup(template, reactData, [`${webserver}/dist/client.js`]);

				callback(null);
			});
		});
	});
});


app.listen(port, () => {
	console.info("==> ✅  Server is listening");
	console.info("==> 🌎  Go to http://%s:%s", hostname, port);
});

let io = socketio.listen(4000);
io.sockets.on('connection', (socket) => {
	socket.on('drawClick', (data) => {
		socket.broadcast.emit('draw', {
			x: data.x,
			y: data.y,
			type: data.type
		});
	});
});