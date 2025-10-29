package facilitatorclient_test

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/coinbase/x402/go/pkg/facilitatorclient"
	"github.com/coinbase/x402/go/pkg/types"
)

func TestVerify(t *testing.T) {
	// Create test server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/verify" {
			t.Errorf("Expected to request '/verify', got: %s", r.URL.Path)
		}
		if r.Method != "POST" {
			t.Errorf("Expected POST request, got: %s", r.Method)
		}

		resp := types.VerifyResponse{
			IsValid: true,
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	// Create client with test server URL
	config := &types.FacilitatorConfig{
		URL: server.URL,
	}
	client := facilitatorclient.NewFacilitatorClient(config)

	// Test data
	paymentPayload := &types.PaymentPayload{
		X402Version: 1,
		Scheme:      "exact",
		Network:     "bsc-mainnet",
		Payload: &types.ExactEvmPayload{
			Signature: "0xvalidSignature",
			Authorization: &types.ExactEvmPayloadAuthorization{
				From:        "0xvalidFrom",
				To:          "0xvalidTo",
				Value:       "1000000",
				ValidAfter:  "1745323800",
				ValidBefore: "1745323985",
				Nonce:       "0xvalidNonce",
			},
		},
	}
	paymentRequirements := &types.PaymentRequirements{
		Scheme:            "exact",
		Network:           "bsc-mainnet",
		MaxAmountRequired: "1000000",
		Resource:          "https://example.com/resource",
		Description:       "Test resource",
		MimeType:          "application/json",
		PayTo:             "0x123",
		MaxTimeoutSeconds: 30,
		Asset:             "0xusdcAddress",
	}

	// Test verify
	resp, err := client.Verify(paymentPayload, paymentRequirements)
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}
	if !resp.IsValid {
		t.Errorf("Expected valid response, got invalid")
	}
}

func TestSettle(t *testing.T) {
	// Create test server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/settle" {
			t.Errorf("Expected to request '/settle', got: %s", r.URL.Path)
		}
		if r.Method != "POST" {
			t.Errorf("Expected POST request, got: %s", r.Method)
		}

		resp := types.SettleResponse{
			Success:     true,
			Transaction: "0xvalidTransaction",
			Network:     "bsc-mainnet",
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	// Create client with test server URL
	config := &types.FacilitatorConfig{
		URL: server.URL,
	}
	client := facilitatorclient.NewFacilitatorClient(config)

	// Test data
	paymentPayload := &types.PaymentPayload{
		X402Version: 1,
		Scheme:      "exact",
		Network:     "bsc-mainnet",
		Payload: &types.ExactEvmPayload{
			Signature: "0xvalidSignature",
			Authorization: &types.ExactEvmPayloadAuthorization{
				From:        "0xvalidFrom",
				To:          "0xvalidTo",
				Value:       "1000000",
				ValidAfter:  "1745323800",
				ValidBefore: "1745323985",
				Nonce:       "0xvalidNonce",
			},
		},
	}
	paymentRequirements := &types.PaymentRequirements{
		Scheme:            "exact",
		Network:           "bsc-mainnet",
		MaxAmountRequired: "1000000",
		Resource:          "https://example.com/resource",
		Description:       "Test resource",
		MimeType:          "application/json",
		PayTo:             "0x123",
		MaxTimeoutSeconds: 30,
		Asset:             "0xusdcAddress",
	}

	// Test settle
	resp, err := client.Settle(paymentPayload, paymentRequirements)
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}
	if !resp.Success {
		t.Errorf("Expected successful response, got unsuccessful")
	}
	if resp.Transaction != "0xvalidTransaction" {
		t.Errorf("Expected transaction '0xvalidTransaction', got: %s", resp.Transaction)
	}
	if resp.Network != "bsc-mainnet" {
		t.Errorf("Expected network 'bsc-mainnet', got: %s", resp.Network)
	}
}

func TestTimeout(t *testing.T) {
	timeoutDuration := time.Millisecond * 100

	// Create test server that takes a while to respond
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(2 * timeoutDuration)
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	config := &types.FacilitatorConfig{
		URL: server.URL,
		Timeout: func() time.Duration {
			return timeoutDuration
		},
	}

	// Create client with test server URL and a timeout option
	client := facilitatorclient.NewFacilitatorClient(config)

	// Test data
	paymentPayload := &types.PaymentPayload{}
	paymentRequirements := &types.PaymentRequirements{}

	// Test verify with timeout
	_, err := client.Verify(paymentPayload, paymentRequirements)
	t.Log(err)
	if err == nil {
		t.Error("Expected timeout error, got err == nil")
	}
	if !errors.Is(err, context.DeadlineExceeded) {
		t.Errorf("Expected context deadline exceeded error, got: %v", err)
	}
}

func TestVerifyWithAuthHeaders(t *testing.T) {
	var capturedAuthHeader string

	// Create test server that captures the auth header
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedAuthHeader = r.Header.Get("Authorization")
		resp := types.VerifyResponse{
			IsValid: true,
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	// Create mock auth headers function
	createAuthHeaders := func() (map[string]map[string]string, error) {
		return map[string]map[string]string{
			"verify": {"Authorization": "Bearer test-token"},
			"settle": {"Authorization": "Bearer settle-token"},
		}, nil
	}

	// Create client with test server URL and auth headers
	config := &types.FacilitatorConfig{
		URL:               server.URL,
		CreateAuthHeaders: createAuthHeaders,
	}
	client := facilitatorclient.NewFacilitatorClient(config)

	// Test verify with auth headers
	paymentPayload := &types.PaymentPayload{
		X402Version: 1,
		Scheme:      "exact",
		Network:     "bsc-mainnet",
		Payload: &types.ExactEvmPayload{
			Signature: "0xvalidSignature",
			Authorization: &types.ExactEvmPayloadAuthorization{
				From:        "0xvalidFrom",
				To:          "0xvalidTo",
				Value:       "1000000",
				ValidAfter:  "1745323800",
				ValidBefore: "1745323985",
				Nonce:       "0xvalidNonce",
			},
		},
	}
	paymentRequirements := &types.PaymentRequirements{
		Scheme:            "exact",
		Network:           "bsc-mainnet",
		MaxAmountRequired: "1000000",
		Resource:          "https://example.com/resource",
		Description:       "Test resource",
		MimeType:          "application/json",
		PayTo:             "0x123",
		MaxTimeoutSeconds: 30,
		Asset:             "0xusdcAddress",
	}

	_, err := client.Verify(paymentPayload, paymentRequirements)
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}

	// Verify that the auth header was set correctly
	expectedAuthHeader := "Bearer test-token"
	if capturedAuthHeader != expectedAuthHeader {
		t.Errorf("Expected auth header '%s', got: '%s'", expectedAuthHeader, capturedAuthHeader)
	}
}

func TestSettleWithAuthHeaders(t *testing.T) {
	var capturedAuthHeader string

	// Create test server that captures the auth header
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedAuthHeader = r.Header.Get("Authorization")
		resp := types.SettleResponse{
			Success:     true,
			Transaction: "0xvalidTransaction",
			Network:     "bsc-mainnet",
		}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	// Create mock auth headers function
	createAuthHeaders := func() (map[string]map[string]string, error) {
		return map[string]map[string]string{
			"verify": {"Authorization": "Bearer test-token"},
			"settle": {"Authorization": "Bearer settle-token"},
		}, nil
	}

	// Create client with test server URL and auth headers
	config := &types.FacilitatorConfig{
		URL:               server.URL,
		CreateAuthHeaders: createAuthHeaders,
	}
	client := facilitatorclient.NewFacilitatorClient(config)

	// Test settle with auth headers
	paymentPayload := &types.PaymentPayload{
		X402Version: 1,
		Scheme:      "exact",
		Network:     "bsc-mainnet",
		Payload: &types.ExactEvmPayload{
			Signature: "0xvalidSignature",
			Authorization: &types.ExactEvmPayloadAuthorization{
				From:        "0xvalidFrom",
				To:          "0xvalidTo",
				Value:       "1000000",
				ValidAfter:  "1745323800",
				ValidBefore: "1745323985",
				Nonce:       "0xvalidNonce",
			},
		},
	}
	paymentRequirements := &types.PaymentRequirements{
		Scheme:            "exact",
		Network:           "bsc-mainnet",
		MaxAmountRequired: "1000000",
		Resource:          "https://example.com/resource",
		Description:       "Test resource",
		MimeType:          "application/json",
		PayTo:             "0x123",
		MaxTimeoutSeconds: 30,
		Asset:             "0xusdcAddress",
	}

	_, err := client.Settle(paymentPayload, paymentRequirements)
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}

	// Verify that the auth header was set correctly
	expectedAuthHeader := "Bearer settle-token"
	if capturedAuthHeader != expectedAuthHeader {
		t.Errorf("Expected auth header '%s', got: '%s'", expectedAuthHeader, capturedAuthHeader)
	}
}
