#!/bin/bash
sudo cupsctl --remote-admin --remote-any --share-printers
sudo service cups restart
sudo rfcomm bind /dev/rfcomm0 02:1F:32:F9:12:25 1
sudo touch /media/danknugget/E802975C02972F16/Users/danknugget/Documents/CloudWaitressApps/cw-print-headless/startup-success
