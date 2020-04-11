import * as winston from "winston";
import {Loggly} from "winston-loggly-bulk";

winston.add(new Loggly({
	token: "TOKEN",
	subdomain: "SUBDOMAIN",
	tags: ["Winston-NodeJS"],
	json: true
}));

winston.log('info', "Hello World from Node.js!");