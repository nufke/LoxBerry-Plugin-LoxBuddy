# Development environment and build flow

This page describes the development environment and build flow.

## Development environment setup

Note: It is recommended to use a powerful Linux or Windows PC for the development of LoxBuddy, which is based on the [Ionic Framework](https://ionicframework.com/) and [Angular](https://angular.io/) libraries. The resources available on a Raspberry PI are considered insuffient to be used as development platform.

Install the following packages: `nodejs`, `Ionic`, `Angular` and `http-server`:

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
http-server -p 8080 ../webfrontend/html/www
```

The LoxBuddy App is now accessible for testing via a web-browser at `http://localhost:8080`.

## Deployment to LoxBerry

To deploy the App to your LoxBerry, it is recommended to install a [release version](https://github.com/nufke/LoxBerry-Plugin-LoxBuddy/releases) of the plugin.

Alternatively, for development purposes, you can copy the generated web content located in `webfrontend/html/www` to the the LoxBerry directory `webfrontend/html/plugins/loxbuddy/www` and configure a new Apache2 site for this location.
