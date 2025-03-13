@servers(['staging' => ['websitepreview-php83be@ssh100.webhosting.be']])

@task('deploy', ['on' => 'staging'])
cd subsites/egoverse.websitepreview.be
git fetch --prune
git stash
git pull origin main

cd ./app
yarn
yarn build

cd ../server
yarn
npx pm2 restart ./workers/staging-egoverse-socket-server.yaml
@endtask