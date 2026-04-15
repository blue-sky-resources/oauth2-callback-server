#!/bin/bash
set -e

## certificate parameters
COUNTRY_NAME="US"
STATE_NAME="Colorado"
LOCALITY_NAME="Boulder"
ORGANIZATION_NAME="Bluesky Resources"
ORGANIZATIONAL_UNIT_NAME="Local"
COMMON_NAME="blueskyresources.com"
EMAIL_ADDRESS="support@blueskyresources.com"

SERVER_KEY="/usr/src/app/server.key"
SERVER_CRT="/usr/src/app/server.crt"

OPENSSL_SUBJ_OPTIONS="
Country Name (2 letter code): $COUNTRY_NAME
State or Province Name (full name): $STATE_NAME
Locality Name (eg, city) []: $LOCALITY_NAME
Organization Name (eg, company): $ORGANIZATION_NAME
Organizational Unit Name (eg, section) []: $ORGANIZATIONAL_UNIT_NAME
Common Name (e.g. server FQDN or YOUR name) []: $COMMON_NAME
Email Address []: $EMAIL_ADDRESS
"

echo "generating self signed certificate"
echo "with these options: "
echo "$OPENSSL_SUBJ_OPTIONS"
echo ""

## generate self signed certificate
openssl req \
    -new \
    -newkey rsa:4096 \
    -days 365 \
    -nodes \
    -x509 \
    -subj "/emailAddress=$EMAIL_ADDRESS/C=$COUNTRY_NAME/ST=$STATE_NAME/L=$LOCALITY_NAME/O=$ORGANIZATION_NAME/OU=$ORGANIZATIONAL_UNIT_NAME/CN=$COMMON_NAME" \
    -keyout $SERVER_KEY \
    -out $SERVER_CRT

# run the service
echo "running callback server . . . "
npx @blueskyresources/oauth2-callback-server --port 3001

#end
