# Builder's Legacy - Dibs

A Minecraft mod supporting the concept of ownership of chunks in a Minecraft world.

## Installation

Currently, there is no distribution of the mod directly. Instead, you need to pull the code, build it, and then install the resulting mod. Do not worry - it is pretty painless! You do need some software, though:

* `git` - Used to get (ha) the code.
* `nvm` - Used to install and use the correct version of `node`.
  * Upon installation of `nvm`, you will also need to `nvm install v18.1.0` to get the right version of `node`.
* `yarn` - Used to manage dependencies and run the build processes.

Once you have the software installed, do the following in your favorite terminal (ensuring you start in the directory you want the code to land):

```
git clone https://github.com/builders-legacy-mc/dibs.git
cd dibs
nvm use
yarn
yarn build
```

This will create a `.mcpack` file, which will be located in `mod_dist`. Double-click the `.mcpack` file to install.

## Usage

To actually use the mod in a world, the world needs experimental settings enabled. On 1.18.31, they are:

* Wild Update
* Vanilla Experiments
* Holiday Creator Features
* Upcoming Creator Features
* GameTest Framework
* Molang Features

Remember, _these are experimental features_. Things may break - especially between updates. It is strongly recommended you take frequent back-ups of your world in case something goes wrong.

Right now, the mod supports three commands:

* `+bl:dibs` - Call dibs on the chunk at your location (that is, gain ownership).
* `+bl:check` - Check who owns the chunk at your location.
* `+bl:transfer playerName` - Transfer ownership of the chunk at your location to another player provided you own the chunk.

**NOTE** - While owning a chunk prevents other players from building or destroying blocks on it, it does not prevent other players from harming entities on your chunk. Hopefully, protections for entities will come in time.

## Development

This mod is written in TypeScript and managed by NVM and Yarn. With `git`, `nvm`, and `yarn` installed, you can get set up by doing the following:

1. Clone the repo.
2. Run `yarn` to install dependencies.
3. Run `yarn dev` to spin up the TypeScript compiler in "watch" mode.
4. Profit.

**NOTE** - You can create the `.mcpack` file from the resulting code using `yarn bundle`. While you could use `yarn build` as described above, it runs the TypeScript compiler first which is redundant while `yarn dev` is running.

**PRO TIP** - By default, the mod code will output to `dist`. However, you can override that with a `--outDir ...` option. Done correctly, you can actually have the bundler spit the code out into a mod directory inside of your local Minecraft installation. That way, you do not have to manually re-install it every time. You will, however, still need to exit and re-enter your world with every update.
