import sys

with open('frontend/src/app/layout.tsx', 'r') as f:
    content = f.read()

new_content = content.replace('import "./globals.css";', 'import "./globals.css";\nimport { CurrencyProvider } from "@/lib/CurrencyContext";')

new_body = """
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CurrencyProvider>
          {children}
        </CurrencyProvider>
      </body>
"""

import re
new_content = re.sub(r'<body.*?>.*?</body>', new_body, new_content, flags=re.DOTALL)

with open('frontend/src/app/layout.tsx', 'w') as f:
    f.write(new_content)
