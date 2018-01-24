#!/usr/bin/env bash
set -e

echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > ~/.npmrc
if [ $TRAVIS_BRANCH == 'develop' ]; then
    echo -e "\033[0;32mDeploying canary build\033[0m"
    ./node_modules/.bin/lerna publish --canary --yes --npm-client npm
    echo -e "\033[0;32mFinished deploying\033[0m"
fi
if [[ ${TRAVIS_BRANCH} == "master"] && [ !${TRAVIS_PULL_REQUEST} ]]; then
    echo -e "\033[0;32mDeploying\033[0m"
    git config --global user.email "travis@travis-ci.org"
    git config --global user.name "Travis CI"
    git remote set-url origin https://${GH_TOKEN}@github.com/eventific/eventific.git > /dev/null 2>&1
    git checkout -B master
    ./node_modules/.bin/lerna publish --force-publish=* --conventional-commits --yes --skip-git --npm-client npm
    git add --all

    echo -e "\033[0;32mFinished deploying\033[0m"
fi
