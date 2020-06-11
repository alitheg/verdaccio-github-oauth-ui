<h1 align="center">
  📦🔐 Verdaccio Google OAuth - With UI Support
</h1>

<p align="center">
  A Google OAuth Plugin for Verdaccio – <a href="https://www.verdaccio.org">https://www.verdaccio.org</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/verdaccio-github-oauth-ui">
    <img alt="Version" src="https://flat.badgen.net/npm/v/verdaccio-github-oauth-ui?icon=npm">
  </a>
  <a href="https://raw.githubusercontent.com/n4bb12/verdaccio-github-oauth-ui/master/LICENSE">
    <img alt="License" src="https://flat.badgen.net/github/license/n4bb12/verdaccio-github-oauth-ui?icon=github">
  </a>
  <a href="https://github.com/n4bb12/verdaccio-github-oauth-ui/issues/new/choose">
    <img alt="Issues" src="https://flat.badgen.net/badge/github/Create Issue/blue?icon=github">
  </a>
</p>

## About

<img src="screenshots/authorize.png" align="right" width="270"/>

This is a Verdaccio plugin that offers Google OAuth integragtion for both the browser and the command line.

### Features

- UI integration with fully functional login and logout. When clicking the login button the user is redirected to GitHub and returns with a working session.
- Updated usage info and working copy-to-clipboard for setup commands.
- A small CLI for quick-and-easy configuration.

### Compatibility

- Verdaccio 3 and 4
- Node >=10
- Chrome, Firefox, Firefox ESR, Edge, Safari, IE 11

## Setup

### Install

```
$ npm install verdaccio-google-oauth-ui
```

### Google Config

- Create a developer project at https://console.developers.google.com
- Configure the OAuth consent screen and create a set of OAuth credentials
- The callback URL should be `YOUR_REGISTRY_URL/-/oauth/callback`

(screenshot to be updated)
![](screenshots/github-app.png)

### Verdaccio Config

Merge the below options with your existing Verdaccio config:

```yml
middlewares:
  google-oauth-ui:
    enabled: true

auth:
  google-oauth-ui:
    client-id: GITHUB_CLIENT_ID
    client-secret: GITHUB_CLIENT_SECRET
    domain: GOOGLE_DOMAIN

url_prefix: YOUR_REGISTRY_URL
```

- The configured values can either be the actual value or the name of an environment variable that contains the value.
- The config props can be specified under either the `middlewares` or the `auth` node. Just make sure, the addon is included under both nodes.

#### `domain`

Users within this domain will be able to authenticate.

#### `client-id` and `client-secret`

These values can be obtained from GitHub OAuth app page at https://github.com/settings/developers.

#### `url_prefix` (optional)

If configured, it must match `YOUR_REGISTRY_URL`. See [GitHub Config](#GitHub-Config).

### Proxy Config

If you are behind a proxy server, the plugin needs to know the proxy server in order to make GitHub requests.

Configure the below environment variable.

```
$ export GLOBAL_AGENT_HTTP_PROXY=http://127.0.0.1:8080
```

See the [global-agent](https://github.com/gajus/global-agent#environment-variables) docs for detailed configuration instrcutions.

## Login

### Verdaccio UI

- Click the login button and get redirected to Google.
- Authorize the registry for your user
- When completed, you'll be redirected back to the Verdaccio registry.

You are now logged in.

### Command Line

#### Option A) Use the built-in CLI

The easiest way to configure npm is to use this short command:

```
$ npx verdaccio-google-oauth-ui --registry http://localhost:4873
```

#### Option B) Copy commands from the UI

- Verdaccio 4:

Open the "Register Info" dialog and klick "Copy to clipboard":

![](screenshots/register-info.png)

- Verdaccio 3:

Select the text in the header and copy it. In case the text is too long, you can double-click it. The invisible part will still be selected and copied.

![](screenshots/header.png)

- Run the copied commands on your terminal:

```
$ npm config set //localhost:4873:_authToken "SECRET_TOKEN"
$ npm config set //localhost:4873:always-auth true
```

- Verify npm is set up correctly by running the `whoami` command. Example:

```
$ npm whoami --registry http://localhost:4873
n4bb12
```

If you see your Google username, you are ready to start installing and publishing packages.

## Logout

### Verdaccio UI

Click the <kbd>Logout</kbd> button as per usual.

### Command Line

Unless OAuth access is revoked in the Google settings, the token is valid indefinitely.
