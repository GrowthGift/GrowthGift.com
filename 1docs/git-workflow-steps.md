# Git Workflow Steps

First make sure you have the latest changes on `master`:

    git checkout master
    git fetch origin
    git merge origin/master

Make a new local feature branch with a good descriptive name of the unit of work
you are about to start.  Prefix feature branches with the word `feature` to help
keep them organized for the future when we might need other categories of
branches like `release`, `hotfix`, etc.

    git checkout -b feature/<A-DESCRIPTIVE-NAME-OF-THE-UNIT-OF-WORK>

Do your work, making small frequent local commits all along the way.  When you
are ready to push your changes, rebase your commits, creating commits that
better represent the true unit of work.  Sometimes one feature can be viewed as
a single unit of work; other feature work might end up being several.  Use your
best judgement.  When you make your commit, follow good commit message
practices, as described best by [Tim Pope][tpope].

    git checkout master
    git fetch origin
    git merge origin/master
    git checkout feature/<A-DESCRIPTIVE-NAME-OF-THE-UNIT-OF-WORK>
    git rebase master
    git rebase -i master

Now that you're pleased with your work, push it up to your repo:

    git push -u origin feature/<A-DESCRIPTIVE-NAME-OF-THE-UNIT-OF-WORK>

Then issue a pull request in the webapp.

If changes need to be made, make them on the same local branch, rebase from the
latest master again, just in case anything has changed, and push back up to
origin.  In this case, you will need to use `--force` to push your changes up
and overwrite the origin's commits with the newly rewritten ones.  This is the
only time it is generally acceptable to push rewritten commits.

Once the pull request has been merged, you should clean up your local branches
and the branches the origin remote, just to keep everything in order.

    git push origin :feature/<A-DESCRIPTIVE-NAME-OF-THE-UNIT-OF-WORK>
    git branch -d feature/<A-DESCRIPTIVE-NAME-OF-THE-UNIT-OF-WORK>
    