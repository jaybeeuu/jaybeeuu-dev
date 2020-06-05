FROM node:12.18.0

ENV DEBIAN_FRONTEND=noninteractive

ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Configure apt and install packages
RUN apt-get update \
    && apt-get -y install --no-install-recommends apt-utils dialog 2>&1 \
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
    libgtk2.0-0
RUN apt-get install -y \
    libnotify-dev
RUN apt-get install -y \
    libgconf-2-4 \
    libnss3 \
    libxss1
RUN apt-get install -y \
    libasound2 \
    xvfb

# install CircleCI CLI
RUN curl -fLSs --http1.0 https://circle.ci/cli | bash

# Clean up
RUN apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Make docker.host.internal avvailable on all hosts https://github.com/docker/for-linux/issues/264
RUN echo -e "`/sbin/ip route|awk '/default/ { print $3 }'`\tdocker.host.internal" | sudo tee -a /etc/hosts > /dev/null

ENV DEBIAN_FRONTEND=
