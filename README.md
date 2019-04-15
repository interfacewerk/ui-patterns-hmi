# Ng App Seed

This project is a seed for any of our Angular applications. With it, you should be able to get up and running real fast:

* start developing with a local server
* run the unit tests
* deploy to Heroku
* setup CircleCI

Make sure to use the correct node version (we recommend nvm to mange the node versions). Development with docker is possible, but in more complex projects which require multiple services, docker becomes necessary.

## Clone

```
git clone --depth=1 git@github.com:interfacewerk/ng-app-seed.git my-app
```

## Docker

Docker is one of the main blocks of our development setup.

## Start a local server

Watches your changes, bundle and serve the app:

```
docker-compose up
```

[Check this out](http://localhost:4200)

## Start unit tests

Watches your changes and execute unit tests on the fly:

```
docker-compose -f docker-compose.test.yml up
```

[Check this out](http://localhost:9876)
