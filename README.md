atmosphere
==========

**atmosphere** is a asynchronous communication service.

## Requirements

* **vert.x** : 2.0.1.final or higher
* **MongoDB** : 2.4.1 or higher

## Usage

1. Install [Vert.x](http://vertx.io/)
2. Install [mongoDB](http://www.mongodb.org/)
3. Clone this repository.
`git clone https://github.com/haushinka2dx/atmosphere.git path-to-install`
4. Change settings. Settings are written in `path-to-install/main/core/constants.js`
    1. Security facts
        * `encryptionPassword` : set not simple string
        * `encryptionIV` : set not simple string
        * `encryptionSalt` : set not simple string
        * `adminUserId` : set anything you want
        * `adminPassword` : set not simple string
    2. Environment facts
        * `restAPIHostname` : set if you need.
        * `restAPIListenPort` : set if you need.
        * `streamingHostname` : set if you need.
        * `streamingListenPort` : set if you need.
        * `persistorHostname` : set hostname that mongod is running.
        * `persistorPort` : set mongod's port number.
        * `persistorDbName` : set mongod's database's name if you need.
    3. General facts
        * `sessionTimeoutMilliseconds` : set appropriate time.  Default is 5 minites, this is too short for almost cases.
        * `authTimeoutMilliseconds` : set appropriate time.  Default is 5 minites, this is too short for almost cases.
5. Move directory
`cd path-to-install`
6. Run atmosphere
`./start.sh`

## Run Spec(Run Test)

### Simple

spec/spec_runner.html is only opened by a browser.

### When performing from a command line

- Please install [PhantomJS](http://phantomjs.org/)
- `cd {repository_root}`
- Execute a command. `./run-spec.sh`

## APIs

See [wiki page](wiki/APIs)
