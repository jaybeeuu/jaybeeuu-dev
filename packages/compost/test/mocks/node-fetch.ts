import { jest } from "@jest/globals";
import type nodeFetch from "node-fetch";

export class FetchError extends Error {}

const fetch: typeof nodeFetch = jest.fn<typeof nodeFetch>();

export default fetch;
