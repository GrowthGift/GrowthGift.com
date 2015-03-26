# Amazon Web Services

## Server Setup

- create EC2 instance
  - Ubuntu (most recent, i.e. 14.04)
- configure (create / edit) security group
  - open ports
    - 22 (SSH)
    - 80 (HTTP)
    - 443 (HTTPS)
    - any other needed ports: 3000-3100 for the application / web sockets
- create new key pair and download it
  - `cd` to the directory you download it (there may be issues if try from a different directory with '../' or other pathnames in front..) to and change permissions
    - if you get permission errors / permission denied public key, try this:
      - http://stackoverflow.com/questions/23392763/aws-ssh-connection-error-permission-denied-publickey
- ssh in to connect: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html
  - `ssh -i key-pair.pem ubuntu@ec2-198-51-100-1.compute-1.amazonaws.com`
- set up additional (non-root) users
  - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/managing-users.html
  - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html#retrieving-the-public-key
- set up linux ubuntu server as normal / as needed


## Domain Names

- point the A record at your domain registrar (i.e. GoDaddy) to your Amazon (Elastic) IP address
  - can optionally lower the TTL first and wait a period of time equal to the original TTL to make the change and this will make it much faster to propagate. Then once the propagation is done, re-raise the TTL for better caching / performance.
    - http://kb.mediatemple.net/questions/908/Understanding+TTL+(time-to-live)