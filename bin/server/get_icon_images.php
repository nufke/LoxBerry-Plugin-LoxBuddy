#!/usr/bin/env php
<?php

require_once "loxberry_system.php";

// path to remote file
$remote_zipfile = 'web/images.zip';
$local_zipfile = 'images.zip';

$ms_list = LBSystem::get_miniservers();
if (!is_array($ms_list)) {
  echo "No Miniservers configured.\n";
}

// get login for first miniserver
$ms = $ms_list[1];

// get FTP of first miniserver
$ftpport = LBSystem::get_ftpport(1);

// open some file to write to
$handle = fopen($local_zipfile, 'w');

// set up basic connection
$ftp = ftp_connect($ms['IPAddress'], $ftpport) or die("Could not connect to {$ms['IPAddress']}.\n");

// login with username and password
$login_result = ftp_login($ftp, $ms['Admin'], $ms['Pass']);

if ($login_result) {
  echo "Connected as {$ms['Admin']}@{$ms['IPAddress']}.\n";
} else {
  echo "User could not connect to {$ms['IPAddress']}.\n";
}

// try to download $remote_zipfile and save it to $handle
if (ftp_fget($ftp, $handle, $remote_zipfile, FTP_BINARY, 0)) {
  echo "successfully written to $local_zipfile.\n";
  // Zip File Name
  $zip = new ZipArchive;
  $res = $zip->open($local_zipfile);
  if ($res === TRUE) {
    // Unzip Path
    $zip->extractTo('/opt/loxberry/webfrontend/html/plugins/loxbuddy/www/assets/icons/svg');
    $zip->close();
    echo "Unzip of $local_zipfile successful!\n";
  } else {
    echo "Unzip failed!\n";
  }
} else {
  echo "Zip file $remote_zipfile not found on miniserver. Skipped.\n";
}

// close the connection and the file handler
ftp_close($ftp);
fclose($handle);
unlink($local_zipfile); // delete temp file

?>
