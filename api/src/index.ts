import { install } from "source-map-support";
install();

import { port } from "./env-vars";
import server from "./server";

server(port);