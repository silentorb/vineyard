# How to Install a Vineyard project #

This requires [Node.js](http://nodejs.org/), [MySQL](http://www.mysql.com/), and [Git](http://git-scm.com/).

1. Create a MySQL database for your project such as example_db.

2. Download the project.

        git clone git@github.com:myrepo/example.git
        cd example
        npm install
        cp config/local-sample.json config/local.json

3. Edit config/local.json and change the "database" value to the name of the database you created.

4. Initialize the database.

        node scripts/db

5. Now you should be able to run the project.

        node run
