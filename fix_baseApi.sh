#!/bin/bash
cat << 'INNER_EOF' > b_fix.txt
  baseQuery: fetchBaseQuery({
    baseUrl: "https://course-selling-platform-api-production.up.railway.app",
INNER_EOF
perl -0777 -pi -e 's/  baseQuery: fetchBaseQuery\(\{\n    baseUrl: "https:\/\/course-selling-platform-api-production-3dd7\.up\.railway\.app",/`cat b_fix.txt`/se' /Users/macbookair/Desktop/Nexo-Prodcuts/CSW/Course-Selling-Platform/src/lib/api/baseApi.ts

