"""Browser regression checks using dummy tokens and local-only API mocks."""

import functools
import json
import os
from pathlib import Path
import threading
import unittest
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlsplit

from playwright.sync_api import sync_playwright


ROOT = Path(os.environ.get("KOTORI_TEST_SITE_ROOT", Path(__file__).resolve().parents[1]))
LOCALES = {
    "ja": ("/pro.html", "KOTORI", "お問い合わせ"),
    "en": ("/en/pro.html", "KOTORI", "Contact"),
    "zh-TW": ("/zh-tw/pro.html", "KOTORI", "聯絡我們"),
    "th": ("/th/pro.html", "KOTORI", "ติดต่อ"),
}
VIEWPORTS = {"desktop": {"width": 1440, "height": 900}, "mobile": {"width": 390, "height": 844}}


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


class SubscriptionErrorsTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(QuietHandler, directory=str(ROOT)))
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.origin = f"http://127.0.0.1:{cls.server.server_port}"
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=os.environ.get("KOTORI_TEST_HEADLESS") == "1")

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def check_scenario(self, scenario):
        for locale, (path, missing_hint, member_hint) in LOCALES.items():
            for viewport_name, viewport in VIEWPORTS.items():
                with self.subTest(scenario=scenario, locale=locale, viewport=viewport_name):
                    context = self.browser.new_context(viewport=viewport, service_workers="block")
                    page = context.new_page()
                    api_requests = []
                    forbidden_requests = []
                    browser_errors = []
                    page.on("pageerror", lambda error: browser_errors.append(str(error)))

                    def route_request(route):
                        url = urlsplit(route.request.url)
                        if f"{url.scheme}://{url.netloc}" != self.origin:
                            if url.netloc == "fonts.googleapis.com" and route.request.resource_type == "stylesheet":
                                route.fulfill(content_type="text/css", body="")
                                return
                            forbidden_requests.append(route.request.url)
                            route.abort()
                            return
                        if url.path.startswith("/api/"):
                            mode = parse_qs(url.query).get("mode", [""])[0]
                            api_requests.append(mode)
                            if mode != "status":
                                forbidden_requests.append(mode)
                                route.abort()
                                return
                            if scenario == "network_failure":
                                route.abort()
                            elif scenario == "status_not_member":
                                route.fulfill(status=403, content_type="application/json", body=json.dumps({"reason": "not_member"}))
                            else:
                                route.fulfill(status=200, content_type="application/json", body=json.dumps({"effectivePlan": "pro" if scenario == "success_paid" else "free", "translationCount": 123}))
                            return
                        route.continue_()

                    context.route("**/*", route_request)
                    query = "" if scenario == "missing_token" else "?st=dummy-group&error=not_member" if scenario == "callback_not_member" else "?st=dummy-group&cs=dummy-session"
                    try:
                        page.goto(self.origin + path + query)
                        error = page.locator("#errorText")
                        panel = page.locator(".pro-status-panel")
                        if scenario in ("success", "success_paid"):
                            page.locator("#translationCountValue").get_by_text("123", exact=True).wait_for()
                            self.assertTrue(panel.is_visible())
                            self.assertFalse(error.is_visible())
                            self.assertEqual(error.text_content(), "")
                            self.assertEqual(page.locator("#currentPlanValue").text_content(), "Pro" if scenario == "success_paid" else "Free")
                            for button in ("#buyStandardBtn", "#buyProBtn"):
                                self.assertTrue(page.locator(button).is_visible())
                                self.assertTrue(page.locator(button).is_enabled())
                            self.assertEqual(page.locator('[data-plan="free"] .plan-btn').get_attribute("data-action"), "portal" if scenario == "success_paid" else "none")
                            self.assertEqual(page.locator("#buyProBtn").get_attribute("data-action"), "portal" if scenario == "success_paid" else "start")
                        else:
                            error.wait_for(state="visible", timeout=5000)
                            self.assertEqual(error.get_attribute("role"), "alert")
                            self.assertTrue(error.text_content().strip())
                            for button in ("#buyStandardBtn", "#buyProBtn"):
                                self.assertFalse(page.locator(button).is_enabled())
                            if scenario in ("missing_token", "callback_not_member"):
                                self.assertFalse(panel.is_visible())
                                self.assertFalse(page.locator("#buyProBtn").is_visible())
                                self.assertEqual(api_requests, [])
                            else:
                                self.assertTrue(panel.is_visible())
                            if scenario == "missing_token":
                                self.assertIn(missing_hint, error.text_content())
                            elif scenario in ("callback_not_member", "status_not_member"):
                                self.assertIn(member_hint, error.text_content())
                                self.assertTrue(page.locator("#contactLink").is_visible())
                                contact_url = urlsplit(page.locator("#contactLink").get_attribute("href"))
                                self.assertEqual(parse_qs(contact_url.query)["st"], ["dummy-group"])
                        self.assertEqual(forbidden_requests, [], "Auth, checkout, and external requests must not run")
                        self.assertEqual(browser_errors, [])
                        self.assertEqual(api_requests, [] if scenario in ("missing_token", "callback_not_member") else ["status"])
                        if screenshot_dir := os.environ.get("KOTORI_TEST_SCREENSHOTS"):
                            target = Path(screenshot_dir)
                            target.mkdir(parents=True, exist_ok=True)
                            page.screenshot(path=str(target / f"{scenario}-{locale}-{viewport_name}.png"), full_page=True)
                    finally:
                        context.close()

    def test_missing_token(self):
        self.check_scenario("missing_token")

    def test_callback_not_member(self):
        self.check_scenario("callback_not_member")

    def test_status_not_member(self):
        self.check_scenario("status_not_member")

    def test_network_failure(self):
        self.check_scenario("network_failure")

    def test_authenticated_free_plan(self):
        self.check_scenario("success")

    def test_authenticated_paid_plan(self):
        self.check_scenario("success_paid")


if __name__ == "__main__":
    unittest.main()
