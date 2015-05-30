Each entry (version) should have a date and one or more of 3 sections: 'Features', 'Bug Fixes', 'Breaking Changes'. Make sure to `git tag` the commit to match the version. Sub / pre-release versions should be hypenated (i.e. 1.0.3-2).


# 0.0.4 (2015-05-29)

## Features
- switch to using `notorii:array` atmosphere package (remove local `nrane9:array1` package)
- update npm deploy script to set a forever log file (i.e. for use with logentries)


# 0.0.3 (2015-04-25)

## Features
- add / fill in `README.md`
- rename `CHANGELOG.md` file to `CHANGELOG-seed.md` to differentiate from project changelog
- accounts-password: add resentEnrollmentEmail method


# 0.0.2 (2015-03-31)

## Bug Fixes
- password-reset: log out user first if logged in

## Features
- style: list class updates
- accounts-password: return userId of created user
- style: `.a-div` no underline, add `.list-even-odd`


# 0.0.1 (2015-03-26)

## Features
- [init, start changelog]