# Development environment and build flow

This page describes the development environment, build flow and deployment process.

## Development environment setup

**Important: It is recommended to use a powerful Linux or Windows PC for the development of LoxBuddy, which is based on the [Ionic Framework](https://ionicframework.com/) and [Angular](https://angular.io/) libraries. The resources available on a Raspberry PI are considered insufficient to be used as development platform.**

Make sure your development platform supports `nodejs` (v18.x.x or later) and `npm` (v9.x.x or later).

Install the following packages globally: `Ionic` (v7.1.1), `Angular` (v16.0.0) and `http-server` (v14.1.0):
```
npm i -g @ionic/cli@7.1.1
npm i -g @angular/cli@16.0.0
npm i -g http-server@14.1.0
```

Clone this repository:
```
git clone https://github.com/nufke/LoxBerry-Plugin-LoxBuddy.git
```

The repository contains two branches:

 * The [main](https://github.com/nufke/LoxBerry-Plugin-LoxBuddy/tree/main) branch contains the source files and the build flow to generate the App. This branch is used for development.
 * The [release](https://github.com/nufke/LoxBerry-Plugin-LoxBuddy/tree/release) branch already contains the generated App content and does not need execution of the build flow.

Using these two branches, the source files and generated App content is strictly separated. The release branch can be deployed directly to the target platform/browser, and this releae branch is therefore also used to create the plugin for the LoxBerry installer.

For development, make sure you are on the main branch:
```
git checkout main
```

## Build and test

You can build and test the LoxBuddy application as follows:
```
cd LoxBerry-Plugin-LoxBuddy/bin/client/
npm i
ionic serve
```

The LoxBuddy App is now accessible for testing via a web-browser at `http://localhost:8100`.

*Note 1: For development purposes, local (unsecure) connections are allowed (i.e. HTTP and WS). However, when deploying the PWA to a production environment, secure connections are mandatory (HTTPS, WSS).*

*Note 2: It is recommended to use Chrome as web-browser, and open Chrome DevTools using F12 to see the program execution in the Console, etc.*

## Deployment to LoxBerry

To deploy the App to your LoxBerry, it is recommended to install a [release version](https://github.com/nufke/LoxBerry-Plugin-LoxBuddy/releases) of the plugin using the LoxBerry install procedure. In this way, the App content, Apache2 webserver settings and icons are installed automatically.

Alternatively, for development purposes, you can build the PWA and copy it to Loxberry:
```
cd LoxBerry-Plugin-LoxBuddy/bin/
ionic build --prod
```

Copy the content generated in `webfrontend/html/www` and its subdirectories to the the LoxBerry directory `/opt/loxberry/webfrontend/html/plugins/loxbuddy/www` and configure a new [Apache2 site](https://github.com/nufke/LoxBerry-Plugin-LoxBuddy/blob/main/config/apache2.conf) for this location.

In addition, you need to copy the Miniserver icon files (e.g. `images.zip` and `IconLibrary.zip`) to the LoxBerry directory `/opt/loxberry/webfrontend/html/plugins/loxbuddy/www/assets/icons/svg`.

You can also test the production build in your development environment:
```
cd LoxBerry-Plugin-LoxBuddy/bin/client/
ionic build --prod
http-server -p 8200 ../webfrontend/html/www
```

The LoxBuddy App is now accessible for testing via a web-browser at `http://localhost:8200`.

*Note: Since a production version as been built (using `--prod`), the PWA requires secure connections (HTTPS, WSS).*