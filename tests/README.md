# Subscription page regression checks

Install Python 3.10+ and Playwright, then run from the repository root:

```sh
python -m pip install playwright
python -m playwright install chromium
python -m unittest discover -s tests -v
```

The suite starts an ephemeral localhost server and a clean Chromium context for
each case. It covers all four languages at desktop (1440×900) and mobile
(390×844) sizes: missing group link, callback `not_member`, status API
`not_member`, network failure, and authenticated Free and Pro plans (48 cases).

Only dummy tokens and mocked status responses are used. External requests and
API modes other than `status` are blocked and fail the test. The Google Fonts
stylesheet is replaced with an empty local response, so screenshots use system
fallback fonts. No login, checkout,
payment, or contact submission is performed. Chromium runs headed by default;
set `KOTORI_TEST_HEADLESS=1` for CI. Set `KOTORI_TEST_SCREENSHOTS` to an output
directory to save full-page screenshots. `KOTORI_TEST_SITE_ROOT` can point to a
separate checkout when verifying that the cases reproduce on an older version.
