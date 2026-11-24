#!/usr/bin/env bash
# Tests the package the way an app gets it: packs it, generates a new app from
# an Ember CLI blueprint, installs the tarball, and runs this addon's unit tests
# inside that app, with async observers and again with sync observers.
#
#   scripts/test-consumer.sh 3.28            # Ember CLI 3.28 app, its own ember-source
#   scripts/test-consumer.sh 6.4 6.12        # Ember CLI 6.4 app with ember-source ~6.12.0
#   scripts/test-consumer.sh 7.4             # Vite app
#
# Needs Node 18 or later (20.19 or later for Ember CLI 7), yarn 1 and Chrome.
# The app is built in a temp directory, or in $CONSUMER_DIR if set. Set
# $TEST_PORT to run two of these at once.
#
# This is the only place Ember 3.28 and later are tested: this branch's own
# toolchain cannot build them. It is also the only run that sees the package as
# published, with the dependencies an app really gets.
set -euo pipefail

CLI="${1:?usage: scripts/test-consumer.sh <ember-cli version> [ember-source version]}"
SOURCE="${2:-}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="${CONSUMER_DIR:-$(mktemp -d)}"
PORT="${TEST_PORT:-7357}"
APP=consumer
mkdir -p "$WORK"

echo "== packing ember-audio"
TARBALL="$WORK/$(cd "$ROOT" && npm pack --silent --pack-destination "$WORK" | tail -1)"

echo "== generating an app with ember-cli@$CLI in $WORK"
cd "$WORK"
rm -rf "$APP"
npx --yes "ember-cli@$CLI" new "$APP" --skip-npm --skip-git --no-welcome > "$WORK/ember-new.log" 2>&1 \
  || { cat "$WORK/ember-new.log"; exit 1; }
cd "$APP"

# The app must not supply anything the addon needs, so its own ember-fetch goes.
# Blueprints before Ember CLI 5 float to a Testem that needs a newer Node
# module system than their other tooling provides, so those get the last one
# that works.
node -e '
  const fs = require("fs");
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  delete pkg.devDependencies["ember-fetch"];
  if (Number(process.argv[1].split(".")[0]) < 5) {
    pkg.resolutions = Object.assign({}, pkg.resolutions, { testem: "3.10.1" });
  }
  fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
' "$CLI"

mkdir -p tests/unit tests/helpers
cp -r "$ROOT"/tests/unit/. tests/unit/
cp "$ROOT"/tests/helpers/*.js tests/helpers/
# The addon's tests reach its app re-exports through its demo app, "dummy".
find tests/unit -name '*.js' -exec perl -pi -e "s#from 'dummy/#from '$APP/#" {} +

echo "== installing"
PACKAGES=("ember-audio@file:$TARBALL")
[ -n "$SOURCE" ] && PACKAGES+=("ember-source@~$SOURCE.0")
yarn add --dev "${PACKAGES[@]}" --ignore-engines --non-interactive > "$WORK/install.log" 2>&1 \
  || { tail -30 "$WORK/install.log"; exit 1; }

# yarn caches tarballs, so make sure the app got the code that was just packed.
mkdir -p "$WORK/unpacked"
tar -xzf "$TARBALL" -C "$WORK/unpacked"
diff -r "$WORK/unpacked/package/addon" node_modules/ember-audio/addon \
  || { echo "The installed ember-audio is not the packed one."; exit 1; }

INSTALLED="$(node -p "require('ember-source/package.json').version")"

# A module that fails to load can leave the test run waiting forever.
limit() { if command -v timeout > /dev/null; then timeout 600 "$@"; else "$@"; fi; }

run_tests() {
  if [ -f vite.config.mjs ]; then
    rm -rf dist
    limit ./node_modules/.bin/vite build --mode development > "$WORK/build.log" 2>&1 \
      || { cat "$WORK/build.log"; return 1; }
    limit ./node_modules/.bin/testem ci --port "$PORT"
  else
    limit ./node_modules/.bin/ember test --test-port "$PORT"
  fi
}

for ASYNC in true false; do
  echo "== ember-cli $CLI, ember-source $INSTALLED, default-async-observers: $ASYNC"
  EMBER_OPTIONAL_FEATURES="{\"default-async-observers\":$ASYNC}" run_tests
done
