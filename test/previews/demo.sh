
# ============================================================================
# Tailscale VPN Setup
# ============================================================================
# Install Tailscale and join the VPN network if an auth key is provided.
# This enables secure access to instances via Tailscale mesh network.

echo "[+] Installing Tailscale"
curl -fsSL https://tailscale.com/install.sh | sh || true

echo "[+] Tailscale up (if auth key present)"
export AWS_DEFAULT_REGION="$AWS_REGION"
# Load env exported earlier; expect TS_AUTHKEY or TAILSCALE_AUTHKEY
if [ -f "$ENV_FILE" ]; then
  set -a
  . "$ENV_FILE" || true
  set +a
fi
AUTHKEY="${TS_AUTHKEY:-${TAILSCALE_AUTHKEY:-}}"
if [ -n "$AUTHKEY" ]; then
  HOSTNAME="$APP_NAME-$(hostname)"
  tailscale up --ssh --accept-risk lose-ssh --hostname "$HOSTNAME" --authkey "$AUTHKEY" || true
fi