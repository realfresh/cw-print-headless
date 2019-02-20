#!/bin/bash

COMMAND=$1
CWD_DIR=$2
SCRIPT_DIR=$3
USR=$4

if [[ ${COMMAND} == "startup" ]]; then

croncmd="service cups restart"
cronjob="*/30 * * * * $croncmd"

( crontab -l | grep -v -F "$croncmd" ; echo "$cronjob" ) | crontab -

echo "CRON JOB INSTALLED"

cat <<- EOF > ${CWD_DIR}/startup.sh
#!/bin/bash
sudo cupsctl --remote-admin --remote-any --share-printers
sudo service cups restart
sudo rfcomm bind /dev/rfcomm0 02:1F:32:F9:12:25 1
sudo touch ${CWD_DIR}/startup-success
EOF

sudo cat <<- EOF > /etc/systemd/system/cw-print-startup.service
[Unit]
Description=Headless Printing Startup
After=bluetooth.service
Requires=bluetooth.service

[Service]
User=root
ExecStart=${CWD_DIR}/startup.sh

[Install]
WantedBy=multi-user.target
EOF

sudo cat <<- EOF > /etc/systemd/system/cw-print.service
[Unit]
Description=Headless Printing
After=network.target
Wants=cw-print-startup.service

[Service]
User=${USR}
WorkingDirectory=${CWD_DIR}
ExecStart=/usr/bin/node ${SCRIPT_DIR}/index.js start
Restart=always
RestartSec=500ms
StartLimitInterval=0

[Install]
WantedBy=multi-user.target
EOF

sudo chmod +x ${CWD_DIR}/startup.sh

sudo loginctl enable-linger ${USR}

sudo systemctl disable cw-print-startup.service
sudo systemctl disable cw-print.service

sudo systemctl enable cw-print-startup.service
sudo systemctl enable cw-print.service

sudo systemctl daemon-reload

fi

