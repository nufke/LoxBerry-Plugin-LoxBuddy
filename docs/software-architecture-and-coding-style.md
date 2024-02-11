# Software architecture and coding style

This page contains information on the software architecture of the LoxBuddy App and the applied coding style.

The image below gives an overview of the LoxBuddy App software architecture:

<img src="https://github.com/nufke/LoxBerry-Plugin-LoxBuddy/blob/main/docs/sw-architecture.svg">

The App uses the concept of an *observable store*, to manage the overall App state. A custom, small and simple [RxJS](https://angular.io/guide/rx-library)-based implementation has been realized, without the use of any external packags or dependecies such as [NgRx](https://v7.ngrx.io/guide/store). Of course this has the disadvantage that there are no bindings to DevTools, but for this simple App this was not a requirement.

Different services are introduced acting as *middle layer* to manage the communication between the Application front-end and back-end, to manage Controls, Data and Settings. The most important service is the LoxBerryService, which manages the MQTT communcation to the MQTT server, and updates the internal App state via the DataService. The application front-end primarily communicates with the ControlService, receiving regular updates of all control states as well as sending control updates based on the user (menu) interaction.

The application front-end implements the pages and views for the Graphical User Interface (GUI). The *view model* concept has been introduced to decouple the data model from the App state, focusing on visualization and managing GUI-related state changes in the front-end only, without poluting the underlying data model for the App state.

This architecture has been created to manage the dynamics in state changes in front-end and back-end simultanuously, where user interaction via the GUI happens concurrently with MQTT updates coming from other applications via a MQTT Broker.

## Coding Style Guides

The [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) is followed, where applicable, as the main coding style for the Typescript program.

For the Javascript program, the [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html) is followed, where applicable.
