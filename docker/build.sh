
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "============================================================================"
echo "GEM HR Copilot - Docker Build"
echo "============================================================================"

cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Build backend image
echo -e "${YELLOW}Building backend image...${NC}"
docker compose build backend

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend image built successfully${NC}"
else
    echo -e "${RED}✗ Failed to build backend image${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ All images built successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start services: docker compose up -d"
echo "  2. Check status:  docker compose ps"
echo "  3. View logs:     docker compose logs -f"
