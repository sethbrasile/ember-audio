# Shared by test-ember.sh and test-consumer.sh. Not meant to be run directly.

# A module that fails to load can leave the test run waiting forever.
limit() { if command -v timeout > /dev/null; then timeout 600 "$@"; else "$@"; fi; }

# The number of tests written out in a tests/unit folder. Tests made in a loop
# count once, so a run should pass at least this many.
declared_tests() { grep -rhE "^[[:space:]]*test\\(" "$1" | wc -l | tr -d ' '; }

# checked_run <sync|async> <fewest tests> <command...>
#
# Runs a test command and fails unless it passed, ran at least that many tests,
# and ran them with the observer mode that was asked for. A run can otherwise
# be green having loaded none of the tests, or having ignored the setting.
checked_run() {
  local mode="$1" fewest="$2" log passed
  shift 2
  log="$(mktemp)"

  limit "$@" 2>&1 | tee "$log"

  passed="$(sed -n 's/^# pass *//p' "$log" | tail -1)"
  if [ "${passed:-0}" -lt "$fewest" ]; then
    echo "Only ${passed:-0} tests passed; expected at least $fewest." >&2
    rm -f "$log"
    return 1
  fi
  if ! grep -q "^ok .*Observer mode: observers are $mode by default in this run" "$log"; then
    echo "This run did not use $mode observers." >&2
    rm -f "$log"
    return 1
  fi
  rm -f "$log"
}
