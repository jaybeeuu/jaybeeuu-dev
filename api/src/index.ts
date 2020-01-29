import { install } from "source-map-support";
install();

import { httpsPort } from "./env-vars";
import server from "./server";

server(httpsPort);