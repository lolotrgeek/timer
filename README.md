# Timer
Project based time tracking app to demonstrate the power of native nodeJS service with realtime updates.

## Architecture
The native layer acts as a messaging system and a UI placeholder.
- the messaging system runs as a service
- while the UI placeholder runs as an activity. 

Runs a nodeJS instanace as a background service on Android which handles storage and state.
This version uses Gun for real time storage syncing with a graph across many devices. 

It is designed so that any storage provider can be swapped in easily with a simple adapater using the chainer API.

Data is moved around the app with an emit/listen messaging pattern. This allows everything to be decoupled.
On the Data side this looks like this:

React <-> Native Bridge <-> NodeJS

The native bridge exposes the native APIs and props up frontend and service wrappers so that javascript can be executed in both the UI and Service layers of the app.

- Data layer
-

## Install
Install UI
```
yarn install
```
Install service
```
cd /timer/android/app/src/main/assets/nodejs-project
npm i
```
_
## Running
Use the following to run development and testing.
### Web
```
yarn web
```

### Android
```
yarn start
```
Open Android Studio, 
Open `/timer/android` as project
Use Run 'app' command to open on device/emulator 

To test Android service as a relay peer use 
```
adb forward tcp:8765 tcp:8765
``` 
NOTE* make sure you are connected to `127.0.0.1` as a peer to use Android service as relay peer.
_

## Deploying

### Android
1. Copy Assets and build UI bundle:
```
react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/
```
2. Delete duplicate app.json

3. Build and Sign APK from Android Studio

## Reference 
[Article](https://medium.com/reactbrasil/how-to-create-an-unstoppable-service-in-react-native-using-headless-js-93656b6fd5d1)

[Github](https://github.com/mathias5r/rn-heartbeat)

[Notification Docs](https://developer.android.com/training/notify-user/build-notification.html#Updating)