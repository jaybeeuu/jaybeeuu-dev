from aiohttp import web
import json
import asyncio
import uvloop

asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())

async def handle(request):
    response_obj = {
        "hello": "world",
        "this": "works"
    }
    return web.Response(text=json.dumps(response_obj))

app = web.Application()

app.router.add_get("/", handle)

def main():
    web.run_app(app, port=80)

if __name__ == "__main__":
    main()