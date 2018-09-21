# Home UI

HomeUI is a SmartThings client application with an Apple Home inspired
look-and-feel.

## How it works

This project has 2 parts: a Node-based server and a React-based front end app.
The server serves the front end, mediates between it and Hubitat (taking care of
any cross-origin request issues), and stores configuration data.

## Getting started

1.  Create a Hubitat dashboard with the devices you'd like to control
1.  Clone this repo
1.  `npm install`
1.  Copy `.env.example` to `.env` and edit it. Set:
    * Your preferred server port (e.g., 8080)
    * Hubitat IP
    * Dashboard URL -- cut and paste from the `Local LAN link` in the dashboard
      setup UI (e.g.
      http://10.0.1.99/apps/api/123/dashboard/456?access_token=...)
1.  `npm start`
