const archiver = require("archiver");
const fs = require("fs");

// Make sure the empty mod_dist directory exists and is empty before we start

console.log("Starting bundle process...");

try {
  fs.accessSync("./mod_dist");

  fs.rmSync(
    "./mod_dist",
    {
      "force": true,
      "recursive": true
    }
  );
} catch (e) {
  // Nothing - the directory does not exist
}

fs.mkdirSync("./mod_dist");

// Zip it up!

console.log("Starting archiving process...");

const mcpack = fs.createWriteStream("./mod_dist/bl_dibs.mcpack");
const archive = archiver("zip");

// Set up events

mcpack.on("close", () => {
  console.log(".mcpack created!");
  console.log("Cleaning up...");

  fs.rmSync(
    "./mod_dist/bl_dibs",
    {
      "force": true,
      "recursive": true
    }
  );

  console.log("Bundle finished!");
});

archive.on("error", (e) => {
  console.error("Problem encountered while bundling!");
  console.error(e);
});

// Link the archive to the file

archive.pipe(mcpack);

// Push the contents

console.log("Creating .mcpack...");

// Push the manifest
archive.file(
  "mc_meta/manifest.json",
  {
    "name": "manifest.json"
  }
);

// Push the code
archive.glob(
  "**/*",
  {
    "cwd": "dist"
  },
  {
    "prefix": "scripts"
  }
);

// Finalize!

archive.finalize();
