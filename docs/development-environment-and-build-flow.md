# Development environment and build flow

This page describes the development environment and build flow.

## Environment setup

It is recommended to use a Linux or Windows PC and install the following packages: `nodejs`, `Ionic`, `Angular` and `http-server`:

```
npm i -g @ionic/cli
npm i -g @angular/cli
npm i -g http-server
```

Clone this repository:
```
git clone https://github.com/nufke/LoxBerry-Plugin-LoxBuddy.git
```

## Build and test

You can build and test the LoxBuddy application as follows:
```
cd LoxBerry-Plugin-LoxBuddy/bin/
npm i
ionic build --prod
http-server -p 8080 www
```

The LoxBuddy App is now accessible for testing via a web-browser at `http://localhost:8080`.
