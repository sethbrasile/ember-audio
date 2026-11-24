#!/usr/bin/env bash
# Tests the package the way an app gets it: packs it, generates a new app from
# an Ember CLI blueprint, installs the tarball, and runs this addon's unit tests
# inside that app, with async observers and again with sync observers.
#
#   scripts/test-consumer.sh 3.28            # Ember CLI 3.28 app, its own ember-source
#   scripts/test-consumer.sh 6.4 6.12        # Ember CLI 6.4 app with ember-source ~6.12.0
#   scripts/test-consumer.sh 7.4             # Vite app
#
# Needs Node 16 or later (20.19 or later for Ember CLI 7), yarn 1 and Chrome.
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
. "$ROOT/scripts/checked-run.sh"
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

# yarn caches tarballs, so make sure the app got the package that was just
# packed, file for file.
rm -rf "$WORK/unpacked"
mkdir -p "$WORK/unpacked"
tar -xzf "$TARBALL" -C "$WORK/unpacked"
diff -r --exclude=node_modules "$WORK/unpacked/package" node_modules/ember-audio \
  || { echo "The installed ember-audio is not the packed one."; exit 1; }

version_of() { node -p "require('$1/package.json').version"; }
INSTALLED="$(version_of ember-source)"
if [ -f vite.config.mjs ]; then BUILD="Vite $(version_of vite)"; else BUILD="classic build"; fi
echo "== installed: node $(node --version), ember-cli $(version_of ember-cli), ember-source $INSTALLED, $BUILD"
echo "== package: $(basename "$TARBALL"), $(find "$WORK/unpacked/package" -type f | wc -l | tr -d ' ') files, sha1 $(node -p "require('crypto').createHash('sha1').update(require('fs').readFileSync('$TARBALL')).digest('hex')")"

FEWEST="$(declared_tests "$ROOT/tests/unit")"

# $TEST_BROWSERS picks the browsers, e.g. "Chrome,Firefox". The default is the
# app's own choice, which is Chrome.
LAUNCH=()
[ -n "${TEST_BROWSERS:-}" ] && LAUNCH=(--launch "$TEST_BROWSERS")

run_tests() {
  local mode="$1"
  if [ -f vite.config.mjs ]; then
    rm -rf dist
    limit ./node_modules/.bin/vite build --mode development > "$WORK/build.log" 2>&1 \
      || { cat "$WORK/build.log"; return 1; }
    checked_run "$mode" "$FEWEST" ./node_modules/.bin/testem ci --port "$PORT" ${LAUNCH[@]+"${LAUNCH[@]}"}
  else
    checked_run "$mode" "$FEWEST" ./node_modules/.bin/ember test --test-port "$PORT" ${LAUNCH[@]+"${LAUNCH[@]}"}
  fi
}

echo "== ember-source $INSTALLED, async observers"
EMBER_OPTIONAL_FEATURES='{"default-async-observers":true}' run_tests async

echo "== ember-source $INSTALLED, sync observers"
EMBER_OPTIONAL_FEATURES='{"default-async-observers":false}' run_tests sync
