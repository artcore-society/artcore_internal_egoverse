@servers(['staging' => ['websitepreview-php83be@ssh100.webhosting.be']])

@task('deploy', ['on' => 'staging'])
cd subsites/egoverse.websitepreview.be
git fetch --prune
git stash
git pull origin main

# Fetch and pull git lfs changes
git lfs fetch
git lfs pull

# Prune old LFS files
git lfs prune

# Build the frontend app
cd ./app
yarn
yarn build

# Install dependencies and restart the socket server
cd ../server
yarn
npx pm2 restart ./workers/staging-egoverse-socket-server.yaml
@endtask