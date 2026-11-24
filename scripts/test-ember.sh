#!/usr/bin/env bash
# Runs this addon's own test suite against one ember-source version: once with
# synchronous observers, and once more with async observers on Ember 3.13 and
# later (the setting does nothing before that).
#
#   scripts/test-ember.sh              # the locked ember-source
#   scripts/test-ember.sh 3.16         # ember-source ~3.16.0
#   scripts/test-ember.sh 3.16 --filter "Connectable"
#
# Needs Node 6 through 16 (this branch builds with Ember CLI 3.8) and yarn 1.
# This toolchain builds Ember 2.18 through 3.24. For newer Ember use
# scripts/test-consumer.sh.
#
# Other versions are installed on top of yarn.lock, and package.json, yarn.lock
# and node_modules are put back afterwards.
set -euo pipefail
cd "$(dirname "$0")/.."

VERSION="${1:-}"
[ $# -gt 0 ] && shift

if [ -n "$VERSION" ]; then
  BACKUP="$(mktemp -d)"
  cp package.json yarn.lock "$BACKUP/"
  restore() {
    cp "$BACKUP/package.json" "$BACKUP/yarn.lock" .
    rm -rf "$BACKUP"
    yarn install --frozen-lockfile --ignore-engines --non-interactive > /dev/null
  }
  trap restore EXIT
  yarn add --dev "ember-source@~$VERSION.0" --ignore-engines --non-interactive > /dev/null
fi

INSTALLED="$(node -p "require('ember-source/package.json').version")"
HAS_ASYNC="$(node -p "var v = '$INSTALLED'.split('.').map(Number); v[0] > 3 || (v[0] === 3 && v[1] >= 13)")"

echo "== ember-source $INSTALLED, sync observers"
DEFAULT_ASYNC_OBSERVERS=false ./node_modules/.bin/ember test "$@"

if [ "$HAS_ASYNC" = "true" ]; then
  echo "== ember-source $INSTALLED, async observers"
  DEFAULT_ASYNC_OBSERVERS=true ./node_modules/.bin/ember test "$@"
fi
