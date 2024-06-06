# Conv

A utility for loading a typesafe env.

## Usage

Conv reads a `.env` file, in the current working directory, using `dotenv`. Then validates the variables you expect to find in it.

```ts
import { conv } from "@jaybeeuu/conv";

interface Environment {
  SECRET_KEY: string;
  URL: string;
  USE_COMPRESSION?: string;
}

const env: Environment = conv(
  "SECRET_KEY",
  { name: "URL", default: "https://dev.your-domain.com" },
  { name: "USE_COMPRESSION", optional: true },
); // ✅
```

If the environment doesn't match expectations then an exception will be thrown.
