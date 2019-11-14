FROM ubuntu:18.04

ENV NODE_VERSION=node_12.x
ENV DISTRO="bionic" 
RUN apt-get update
RUN apt-get install -y curl gnupg2
RUN curl -sSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - \
        && echo "deb https://deb.nodesource.com/${NODE_VERSION} $DISTRO main" | tee /etc/apt/sources.list.d/nodesource.list \
        && echo "deb-src https://deb.nodesource.com/${NODE_VERSION} $DISTRO main" | tee -a /etc/apt/sources.list.d/nodesource.list \
RUN apt-get update
RUN apt-get install -y nodejs npm

RUN npm install -g npm@latest

RUN useradd -ms /bin/bash ubuntu

WORKDIR /home/ubuntu
RUN mkdir packages && chown -R ubuntu:ubuntu packages
