import uvicorn

from fastapi import FastAPI
from pydantic import Field
import os
from fastapi.responses import HTMLResponse

controller = FastAPI()


@controller.get("/", response_class=HTMLResponse)
async def index():
    web_page = """
    <html>
        <head>
            <title>Some HTML in here</title>
        </head>
        <body>
            <h1>Look ma! HTML!</h1>
        </body>
    
    </html>
    """
    return web_page


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("__main__:controller", host="0.0.0.0", port=8080, reload=True)
