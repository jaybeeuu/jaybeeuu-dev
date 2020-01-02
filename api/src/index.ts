import { install } from "source-map-support";
install();

import { httpPort, httpsPort } from "./env-vars";
import server from "./server";

server(httpPort, httpsPort);