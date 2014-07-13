#!/usr/bin/env node

var fs = require('fs'),
    sh = require("shelljs"),
    git = require('gift'),
    opts = require('minimist'),
    argv = opts(process.argv.slice(2)),
    repo = git(sh.pwd()),
    remote = argv.remote || 'origin',
    branch = argv.branch || 'master',
    ghPages = remote + '/gh-pages',
    seed = Math.random().toString(36).substring(10).substring(0, 6);

    repo.remote_fetch(remote, function (e) {

      if (e) { return new Error(e.text); }

      repo.checkout(['-b', seed, ghPages].join(' '), function (e) {

        if (e) { return new Error(e.text); }

        repo.checkout(branch + ' README.md', function (e) {

          if (e) { return new Error(e.text); }

          sh.cp('-f', 'README.md', '_includes/');

          repo.add('_includes/README.md', function (e) {

            if (e) { return new Error(e.text); }

            repo.commit('updated dorsal site', function (e) {

              repo.remote_push(remote, seed + ':gh-pages' , function (e) {
                if (e) {
                  return new Error(e.text)
                }
                else {
                  repo.checkout(branch, function (e) {

                    if (e) { return new Error(e.text); }

                    repo.delete_branch(seed, function (e) {

                      if (e) { return new Error(e.text); }
                      else   {console.log('gh-pages updated')}
                    })
                  })
                }
              })
            })
          })
        })
      })
    });
