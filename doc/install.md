# How to Install a Vineyard project #

This assumes you have [Node.js](http://nodejs.org/) and [Git](http://git-scm.com/) installed.

1. Create a MySQL database for your project such as example_db.

2. Download the project.

        git clone git@github.com:myrepo/example.git
        cd example
        npm install
        cp config/local-sample.json config/local.json

3. Edit config/local.json and change the "database" value to the name of the database you created.)

4. Initialize the database with:

        node scripts/db

5. Now you should be able to run the project.

        node run