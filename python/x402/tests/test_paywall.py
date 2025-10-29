from x402.paywall import (
    is_browser_request,
    create_x402_config,
    inject_payment_data,
    get_paywall_html,
)
from x402.types import PaymentRequirements, PaywallConfig


class TestIsBrowserRequest:
    """Test browser detection functionality."""

    def test_browser_request_with_html_accept_and_mozilla(self):
        headers = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        }
        assert is_browser_request(headers) is True

    def test_browser_request_case_insensitive(self):
        headers = {
            "accept": "text/html,application/xhtml+xml",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        }
        assert is_browser_request(headers) is True

    def test_api_client_request(self):
        headers = {
            "Accept": "application/json",
            "User-Agent": "curl/7.68.0",
        }
        assert is_browser_request(headers) is False

    def test_missing_headers(self):
        headers = {}
        assert is_browser_request(headers) is False

    def test_html_accept_but_no_mozilla(self):
        headers = {
            "Accept": "text/html",
            "User-Agent": "curl/7.68.0",
        }
        assert is_browser_request(headers) is False

    def test_mozilla_user_agent_but_no_html(self):
        headers = {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)",
        }
        assert is_browser_request(headers) is False


class TestCreateX402Config:
    """Test x402 configuration creation."""

    def test_create_config_with_payment_requirements(self):
        payment_req = PaymentRequirements(
            scheme="exact",
            network="bsc-mainnet",
            max_amount_required="1000000",  # 1 USDC in atomic units
            resource="https://example.com/api/data",
            description="API data access",
            mime_type="application/json",
            pay_to="0x123",
            max_timeout_seconds=60,
            asset="0xUSDC",
        )

        error = "Payment required"

        config = create_x402_config(error, [payment_req])

        assert config["amount"] == 1.0  # 1 USDC
        assert config["testnet"] is True
        assert config["currentUrl"] == "https://example.com/api/data"
        assert config["error"] == "Payment required"
        assert len(config["paymentRequirements"]) == 1
        assert config["x402_version"] == 1

    def test_create_config_with_mainnet(self):
        payment_req = PaymentRequirements(
            scheme="exact",
            network="base",  # Mainnet
            max_amount_required="500000",  # 0.5 USDC
            resource="https://example.com/api/data",
            description="API data access",
            mime_type="application/json",
            pay_to="0x123",
            max_timeout_seconds=60,
            asset="0xUSDC",
        )

        config = create_x402_config("Payment required", [payment_req])

        assert config["testnet"] is False
        assert config["amount"] == 0.5

    def test_create_config_with_paywall_config(self):
        payment_req = PaymentRequirements(
            scheme="exact",
            network="bsc-mainnet",
            max_amount_required="1000000",
            resource="https://example.com",
            description="Test",
            mime_type="application/json",
            pay_to="0x123",
            max_timeout_seconds=60,
            asset="0xUSDC",
        )

        paywall_config = PaywallConfig(
            cdp_client_key="test-key",
            app_name="Test App",
            app_logo="https://example.com/logo.png",
            session_token_endpoint="https://example.com/token",
        )

        config = create_x402_config("Payment required", [payment_req], paywall_config)

        assert config["cdpClientKey"] == "test-key"
        assert config["appName"] == "Test App"
        assert config["appLogo"] == "https://example.com/logo.png"
        assert config["sessionTokenEndpoint"] == "https://example.com/token"

    def test_create_config_empty_requirements(self):
        config = create_x402_config("No requirements", [])

        assert config["amount"] == 0
        assert config["currentUrl"] == ""
        assert config["testnet"] is True
        assert config["paymentRequirements"] == []


class TestInjectPaymentData:
    """Test payment data injection into HTML."""

    def test_inject_payment_data_basic(self):
        html_content = """
        <html>
        <head>
            <title>Test</title>
        </head>
        <body>
            <h1>Test</h1>
        </body>
        </html>
        """

        payment_req = PaymentRequirements(
            scheme="exact",
            network="bsc-mainnet",
            max_amount_required="1000000",
            resource="https://example.com",
            description="Test",
            mime_type="application/json",
            pay_to="0x123",
            max_timeout_seconds=60,
            asset="0xUSDC",
        )

        result = inject_payment_data(html_content, "Payment required", [payment_req])

        assert "window.x402 = " in result
        assert "console.log('Payment requirements initialized" in result
        assert '"amount": 1.0' in result
        assert '"testnet": true' in result

    def test_inject_payment_data_mainnet_no_console_log(self):
        html_content = """
        <html>
        <head>
            <title>Test</title>
        </head>
        <body>
            <h1>Test</h1>
        </body>
        </html>
        """

        payment_req = PaymentRequirements(
            scheme="exact",
            network="base",  # Mainnet
            max_amount_required="1000000",
            resource="https://example.com",
            description="Test",
            mime_type="application/json",
            pay_to="0x123",
            max_timeout_seconds=60,
            asset="0xUSDC",
        )

        result = inject_payment_data(html_content, "Payment required", [payment_req])

        assert "window.x402 = " in result
        assert "console.log('Payment requirements initialized" not in result
        assert '"testnet": false' in result

    def test_inject_preserves_html_structure(self):
        html_content = """<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Test</title>
        </head>
        <body>
            <h1>Test</h1>
        </body>
        </html>"""

        payment_req = PaymentRequirements(
            scheme="exact",
            network="bsc-mainnet",
            max_amount_required="1000000",
            resource="https://example.com",
            description="Test",
            mime_type="application/json",
            pay_to="0x123",
            max_timeout_seconds=60,
            asset="0xUSDC",
        )

        result = inject_payment_data(html_content, "Payment required", [payment_req])

        # Check that HTML structure is preserved
        assert "<!DOCTYPE html>" in result
        assert '<meta charset="utf-8">' in result
        assert "<h1>Test</h1>" in result

        # Check that script is injected before </head>
        head_end_pos = result.find("</head>")
        script_pos = result.find("window.x402 = ")
        assert script_pos < head_end_pos


class TestGetPaywallHtml:
    """Test the main paywall HTML generation function."""

    def test_get_paywall_html_integration(self):
        payment_req = PaymentRequirements(
            scheme="exact",
            network="bsc-mainnet",
            max_amount_required="2000000",  # 2 USDC
            resource="https://example.com/api/premium",
            description="Premium API access",
            mime_type="application/json",
            pay_to="0x456",
            max_timeout_seconds=120,
            asset="0xUSDC",
        )

        paywall_config = PaywallConfig(
            app_name="My App",
            app_logo="https://example.com/logo.png",
        )

        result = get_paywall_html("Payment required", [payment_req], paywall_config)

        assert isinstance(result, str)
        assert "window.x402 = " in result
        assert '"amount": 2.0' in result
        assert '"appName": "My App"' in result
        assert '"appLogo": "https://example.com/logo.png"' in result
