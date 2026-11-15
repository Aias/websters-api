#!/bin/sh
set -eu
if [ "$(uname -s)" != Darwin ]; then
  echo 'Apple Dictionary compilation requires macOS and the Dictionary Development Kit.' >&2
  exit 1
fi
if [ -z "${DICTIONARY_DEVELOPMENT_KIT:-}" ] || [ ! -x "$DICTIONARY_DEVELOPMENT_KIT/bin/build_dict.sh" ]; then
  echo 'Set DICTIONARY_DEVELOPMENT_KIT to the Apple Dictionary Development Kit directory.' >&2
  exit 1
fi
cd "$(dirname "$0")/../build/macos"
"$DICTIONARY_DEVELOPMENT_KIT/bin/build_dict.sh" Webster1913 Webster1913.xml Webster1913.css Webster1913.plist
