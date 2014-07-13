#!/usr/bin/env node

var fs = require('fs'),
    git = require('gift'),
    conf = require(__dirname + '/config.json'),
    repo = git(conf.repo),
    argv = require('minimist')(process.argv.slice(2)),
    remote = argv.remote || 'origin',
    featured = argv.featured || 'master',
    ghPages = argv.remote + '/gh-pages'
    seed = Math.random().toString(36).substring(10).substring(0, 6);

    repo.checkout(ghPages, function () {

      repo.checkout(featured + ':README.md > _includes/README.md', function () {

        repo.create_branch(seed, function () {

          repo.add('_includes/README.md', function () {

            repo.commit('updated dorsal site', function (e) {
              //repo.remote_push(ghPages, seed)

              if (e) {
                console.dir(e)
              } else
                console.log('funco loco!!!')

            })

          })

        })

      })

    });

