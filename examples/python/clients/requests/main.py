import os
from dotenv import load_dotenv
from eth_account import Account
from x402.clients.requests import x402_requests
from x402.clients.base import decode_x_payment_response, x402Client

# Load environment variables
load_dotenv()

# Get environment variables
private_key = os.getenv("PRIVATE_KEY")
base_url = os.getenv("RESOURCE_SERVER_URL")
endpoint_path = os.getenv("ENDPOINT_PATH")

if not all([private_key, base_url, endpoint_path]):
    print("Error: Missing required environment variables")
    exit(1)

# Create eth_account from private key
account = Account.from_key(private_key)
print(f"Initialized account: {account.address}")


def custom_payment_selector(
    accepts, network_filter=None, scheme_filter=None, max_value=None
):
    """Custom payment selector that filters by network."""
    # Ignore the network_filter parameter for this example - we hardcode bsc-mainnet
    _ = network_filter

    # NOTE: In a real application, you'd want to dynamically choose the most
    # appropriate payment requirement based on user preferences, available funds,
    # network conditions, or other business logic rather than hardcoding a network.

    # Filter by bsc-mainnet network (testnet)
    return x402Client.default_payment_requirements_selector(
        accepts,
        network_filter="bsc-mainnet",
        scheme_filter=scheme_filter,
        max_value=max_value,
    )


def main():
    # Create requests session with x402 payment handling and network filtering
    session = x402_requests(
        account,
        payment_requirements_selector=custom_payment_selector,
    )

    # Make request
    try:
        print(f"Making request to {endpoint_path}")
        response = session.get(f"{base_url}{endpoint_path}")

        # Read the response content
        content = response.content
        print(f"Response: {content.decode()}")

        # Check for payment response header
        if "X-Payment-Response" in response.headers:
            payment_response = decode_x_payment_response(
                response.headers["X-Payment-Response"]
            )
            print(
                f"Payment response transaction hash: {payment_response['transaction']}"
            )
        else:
            print("Warning: No payment response header found")

    except Exception as e:
        print(f"Error occurred: {str(e)}")


if __name__ == "__main__":
    main()
