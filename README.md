# metalthrown


blog written in metalsmith. This is the source for the blog located at http://thrownforaloop.com.
The code's not exactly suitable for reuse.

The posts are located at [another repo](https://github.com/mikedmcfarland/thrown.posts). And can be in org-mode format or markdown.

A local development server can be run with `node serve.js`. It will build the website, host a webserver, and host a livereload server (to reload the page when any changes are made).

To just make a build, use `node buildBlog.js`

To publish, use `./publish`, this will build the site and update the github pages repo.
