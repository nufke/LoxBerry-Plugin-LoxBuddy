#!/bin/bash

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
PCGI=$LBPCGI/$PDIR
PHTML=$LBPHTML/$PDIR
PTEMPL=$LBPTEMPL/$PDIR
PDATA=$LBPDATA/$PDIR
PLOG=$LBPLOG/$PDIR # Note! This is stored on a Ramdisk now!
PCONFIG=$LBPCONFIG/$PDIR
PSBIN=$LBPSBIN/$PDIR
PBIN=$LBPBIN/$PDIR

echo "<INFO> Copy back existing config and log files..."
cp -p -v -r /tmp/$PTEMPDIR\_upgrade/log/$PDIR/* $PLOG
cp -p -v -r /tmp/$PTEMPDIR\_upgrade/config/$PDIR/* $PCONFIG
cp -p -v -r /tmp/$PTEMPDIR\_upgrade/data/$PDIR/* $PDATA

echo "<INFO> Remove temporary folders"
rm -r /tmp/$PTEMPDIR\_upgrade/log
rm -r /tmp/$PTEMPDIR\_upgrade/config
rm -r /tmp/$PTEMPDIR\_upgrade/data
rm -r /tmp/$PTEMPDIR\_upgrade

echo "<INFO> Check and Update LoxBuddy Server configuration..."
node $PBIN/server/update_config.js

# Exit with Status 0
exit 0

