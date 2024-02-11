#!/bin/bash

# Shell script which is executed by bash *AFTER* complete installation is done
# (but *BEFORE* postupdate). Use with caution and remember, that all systems may
# be different!
#
# Exit code must be 0 if executed successfull.
# Exit code 1 gives a warning but continues installation.
# Exit code 2 cancels installation.
#
# Will be executed as user "loxberry".
#
# You can use all vars from /etc/environment in this script.
#
# We add 5 additional arguments when executing this script:
# command <TEMPFOLDER> <NAME> <FOLDER> <VERSION> <BASEFOLDER>
#
# For logging, print to STDOUT. You can use the following tags for showing
# different colorized information during plugin installation:
#
# <OK> This was ok!"
# <INFO> This is just for your information."
# <WARNING> This is a warning!"
# <ERROR> This is an error!"
# <FAIL> This is a fail!"

# To use important variables from command line use the following code:
COMMAND=$0    # Zero argument is shell command
PTEMPDIR=$1   # First argument is temp folder during install
PSHNAME=$2    # Second argument is Plugin-Name for scipts etc.
PDIR=$3       # Third argument is Plugin installation folder
PVERSION=$4   # Forth argument is Plugin version
#LBHOMEDIR=$5 # Comes from /etc/environment now. Fifth argument is
              # Base folder of LoxBerry
PTEMPPATH=$6  # Sixth argument is full temp path during install (see also $1)

# Combine them with /etc/environment
PHTMLAUTH=$LBHOMEDIR/webfrontend/htmlauth/plugins/$PDIR
PHTML=$LBPHTML/$PDIR
PTEMPL=$LBPTEMPL/$PDIR
PDATA=$LBPDATA/$PDIR
PLOGS=$LBPLOG/$PDIR # Note! This is stored on a Ramdisk now!
PCONFIG=$LBPCONFIG/$PDIR
PSBIN=$LBPSBIN/$PDIR
PBIN=$LBPBIN/$PDIR

echo "<INFO> Installing dependencies for LoxBuddy Server..."
npm --prefix $PBIN/server install --only=production

echo "<INFO> Create default configuration..."
node $PBIN/server/update_config.js

echo "<INFO> Starting LoxBuddy Server..."
npm --prefix $PBIN/server run start

echo "<INFO> Copy existing icons to LoxBuddy App..."
php $PBIN/server/get_icon_images.php
php $PBIN/server/get_icon_library.php

echo "<INFO> Install Apache2 site configuration..."
cp $LBHOMEDIR/config/plugins/$PDIR/apache2.conf $LBHOMEDIR/system/apache2/sites-available/001-$PDIR.conf > /dev/null 2>&1

echo "<INFO> Enable and load Apache2 site..."
a2ensite 001-$PDIR > /dev/null 2>&1
service apache2 reload > /dev/null 2>&1

exit 0;