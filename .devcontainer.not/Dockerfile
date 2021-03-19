FROM node:12.18.0

ENV DEBIAN_FRONTEND=noninteractive

ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Configure apt and install packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends apt-utils dialog 2>&1 \
    && apt-get install -y git procps

# Remove yarn
RUN rm -rf /opt/yarn-* \
    && rm -f /usr/local/bin/yarn \
    && rm -f /usr/local/bin/yarnpkg

# Add sudo support for non-root users
RUN apt-get install -y sudo \
    && echo node ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/node \
    && chmod 0440 /etc/sudoers.d/node

# update npm and install lerna
RUN npm install -g npm lerna @microsoft/rush

# install Cypress dependencies (separate commands to avoid time outs)
RUN apt-get install -y \
    libgtk2.0-0 \
    libgtk-3-0
RUN apt-get install -y \
    libnotify-dev \
    libgconf-2-4
RUN apt-get install -y \
    libnss3 \
    libxss1
RUN apt-get install -y \
    libasound2 \
    libxtst6
RUN apt-get install -y \
    xauth \
    xvfb

# Install Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add - \
    && echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' | sudo tee /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable

# Install firefox
RUN echo "deb http://deb.debian.org/debian/ unstable main contrib non-free" >> /etc/apt/sources.list \
    && apt-get update \
    && apt-get install -y firefox

# install CircleCI CLI
RUN curl -fLSs --http1.0 https://circle.ci/cli | bash

# Clean up
RUN apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Make docker.host.internal avvailable on all hosts https://github.com/docker/for-linux/issues/264
RUN echo -e "`/sbin/ip route|awk '/default/ { print $3 }'`\thost.docker.internal" | sudo tee -a /etc/hosts > /dev/null
ENV DISPLAY host.docker.internal:0.0

ENV DEBIAN_FRONTEND=
