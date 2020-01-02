sudo cp -r /root/.ssh-localhost ~
sudo chown -R $(id -u):$(id -g) ~/.ssh-localhost
mv ~/.ssh-localhost /.ssh
chmod 700 ~/.ssh
chmod 600 ~/.ssh/*

./.devcontainer/scripts/gen-certs.sh