FROM python:3.7-alpine3.8

LABEL maintainer="joshbickleywallace@outlook.com"

ENV PIPENV_VENV_IN_PROJECT=true

RUN apk --update add build-base \
    && rm -rf /var/cache/apk/*
RUN pip3 install pipenv

WORKDIR /var/www

# -- Adding Pipfiles
COPY Pipfile Pipfile
COPY Pipfile.lock Pipfile.lock

# -- Install dependencies:
RUN set -ex && pipenv install --dev

# RUN apk del build-base && \
#     rm -rf /root/.cache && \
#     rm -rf /var/cache/apk/* && \
#     rm -rf /tmp/*

COPY . .

EXPOSE 80

ENTRYPOINT [ "pipenv", "run", "python", "./watcher.py" ]
