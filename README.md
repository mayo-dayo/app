# Mayo メヨ

A self-hostable, web-based audio streaming app.

- [Demo](https://mayo.clumsy.fish)
- [Installation](#installation)
- [Configuration](#configuration)

#### Features

- Small and fast client, 42.4 kB of brotli-compressed JavaScript.
- Supports full-text search server-side and client-side.
- Does not require internet connection, music can be downloaded from the server and played offline.

#### Roadmap

- [ ] Playlists
- [ ] Instant mix
- [ ] Better tooling

<p align="center">
    <img src="https://github.com/user-attachments/assets/f83e802b-63e3-46d0-add0-52c5d4427b60" alt="" />
</p>

# Installation

Releases of Mayo are published on Github Container Registry.

Obviously, this means that we are going to use Docker.

Since we are going to use Docker, you must have Docker installed on your system.

https://docs.docker.com/engine/install/

Luckily, this is the hardest part of the installation process, because you won't have to dirty your hands by touching Docker directly.

## Creating a Docker container

As I said, you don't have to touch Docker directly.

Instead, you can download our CLI, which is designed to do all the dirtly work.

At this step you can configure the server port, whether or not authentication is required, and, optionally, TLS.

```sh
# Step 1: Download our CLI utility. It will deal with Docker so you don't have to.
curl -LO https://github.com/mayo-dayo/manage/releases/latest/download/manage

# Step 2: Make it executable.
chmod +x manage

# Step 3: Run the `create` command. This will prompt you to enter some things, and spin up a Docker container.
./manage create
```

To verify the server has been created, you can use another CLI command:

```sh
# List all Mayo instances on the system (you can create multiple).
./manage ls
```

## Creating an invite

In Mayo, in order to create a user account, a so-called invite is required.

Invite determines what permissions, if any, the user will have after creating their account.

You can limit the number of times a particular invite can be used.

An invite can be created using our CLI utility:

```sh
./manage invite create
```

Note: if you receive an error, most likely you just created your server and the database is not yet initialized. To initialize the database, visit the `/sign-in` page and try to sign in with whatever credentials. You will receive an error that the username or the password is incorrect, but this will cause the server to initialize the database.

# Configuration

This is the documentation for how to configure the server without the CLI, but I recommend using the CLI.

### Authentication

By default, users are not required to authenticate to be able to access the server. Unauthenticated users cannot have permissions and therefore can only use features that do not require permissions, i.e. browsing and streaming audio. This is useful if your server is intended to be public.

To enforce authentication, `MAYO_AUTHENTICATION` must be set to `required`, in which case the users will be required to authenticate before being able to browse and stream audio.

### HTTP server

To change the default HTTP server port, set one of `PORT`, `BUN_PORT` or `NODE_PORT` to your desired port.

The default port is `3000`.

To cause the HTTP server to use TLS, both of the following must be set:

- `MAYO_TLS_CRT` - a PEM string containing your certificate.
- `MAYO_TLS_KEY` - a PEM string containing your private key.

### Persistent data

The server needs a place to store the data that needs to be persistent, such as the database that keeps track of your users and content, and the audio data, such as thumbnails and transcoded audio files suitable for streaming.

Thus, you must set `MAYO_DATA_PATH` to the path to a filesystem directory that the server can use for this purpose.

You are **required** to set this variable in order to use the server. There is no default value.
