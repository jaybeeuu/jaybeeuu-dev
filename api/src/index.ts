import { install } from "source-map-support";
install();

import env from "./env";
import server from "./server";

server(env.PORT);