FROM ubuntu:18.04

ARG REACT_APP_BACKEND_URL
ARG REACT_APP_FRONTEND_URL
ARG PROJECT_DIRECTORY
ARG GH_CLIENT_ID
ARG GH_CLIENT_SECRET
ARG MONGODB_URI
ARG SOURCE_VERSION
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV REACT_APP_FRONTEND_URL=$REACT_APP_FRONTEND_URL
ENV PROJECT_DIRECTORY=$PROJECT_DIRECTORY
ENV GH_CLIENT_ID=$GH_CLIENT_ID
ENV GH_CLIENT_SECRET=$GH_CLIENT_SECRET
ENV MONGODB_URI=$MONGODB_URI
ENV REACT_APP_SOURCE_VERSION=$SOURCE_VERSION

ENV DISTRO="bionic" 
RUN apt-get update
RUN apt-get install -y curl gnupg2 build-essential emacs \ 
    nano less git valgrind unzip cmake htop make \
    openjdk-11-jdk haskell-platform
RUN apt-get update -yq \
    && apt-get install curl gnupg -yq \
    && curl -sL https://deb.nodesource.com/setup_12.x | bash \
    && apt-get install nodejs -yq
RUN apt-get update

RUN npm install -g npm@latest
USER root

RUN useradd -ms /bin/bash app_service

EXPOSE 80
COPY packages/ /home/app_service

WORKDIR /home/app_service
RUN chown -R app_service:app_service .

WORKDIR /home/app_service/malte-common
RUN npm ci
RUN npm run build

WORKDIR /home/app_service/rga
RUN npm ci
RUN npm run build

WORKDIR /home/app_service/frontend
RUN npm ci
RUN npm run build
RUN mkdir -p /home/app_service/backend/public_frontend
RUN cp -r build/* /home/app_service/backend/public_frontend

WORKDIR /home/app_service/backend
RUN npm ci

CMD export NODE_ENV="production" && npm start
