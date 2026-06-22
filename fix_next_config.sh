#!/bin/bash
cat << 'INNER_EOF' > n_fix.txt
  async rewrites() {
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "https://course-selling-platform-api-production.up.railway.app";
INNER_EOF
perl -0777 -pi -e 's/  async rewrites\(\) \{\n    const apiBase =\n      process\.env\.NEXT_PUBLIC_API_BASE_URL \?\?\n      "https:\/\/course-selling-api\.up\.railway\.app";/`cat n_fix.txt`/se' /Users/macbookair/Desktop/Nexo-Prodcuts/CSW/Course-Selling-Platform/next.config.js

