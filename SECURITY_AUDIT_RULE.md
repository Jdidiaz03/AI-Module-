# Security Audit Rule

Every push to GitHub must run the `Private information audit subagent` workflow before code is considered clear.

The audit checks committed source files for high-confidence private information patterns, including API keys, access tokens, private keys, JWTs, hard-coded secrets, credit card numbers, and US Social Security numbers.

If the workflow fails:

1. Remove the private value from the code.
2. Rotate the exposed credential if it was real.
3. Re-run the workflow by pushing the cleanup commit.

For intentional non-sensitive fixtures, put `security-audit: allow-next-line` on the line above the fixture. Use this only for fake values that cannot unlock any real account, service, database, or environment.
