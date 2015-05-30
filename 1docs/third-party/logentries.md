# Setup

While you can install logentries as a node package, it's recommended to monitor your entire Operating System (i.e. linux).

This describes the logentries agent ( https://logentries.com/doc/agent/#installation ) but basically you just go to logentries.com and then on the left "Hosts and Logs" section click "+ Add New" and then click the "linux" option and it will show you the command to type into your command prompt for your linux server. If it gives an error use `sudo` in front.

Note that Heroku uses Token TCP and has ONE log per the host whereas installing via an "agent" as above will give multiple (around 11) logs - each following a different log file / source.

You'll then need to add the node/forever log file to see the console.log output:
NOTE: To see forever log file location: `forever list`. It's best to SET the forever log location with the `l path/to/logfile -a` options

`sudo le follow [path to forever/node log] --name [name]`

Make sure to use "sudo" in front: https://logentries.com/doc/frequently-asked-questions/
