import sys
import re

with open('frontend/src/app/dashboard/layout.tsx', 'r') as f:
    content = f.read()

# Replace export default function DashboardLayout
new_dash_layout = """
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardInterior>{children}</DashboardInterior>
  );
}
"""

content = re.sub(r'export default function DashboardLayout.*?\n}', new_dash_layout, content, flags=re.DOTALL)
content = content.replace('import { CurrencyProvider, useCurrency } from "@/lib/CurrencyContext";', 'import { useCurrency } from "@/lib/CurrencyContext";')

with open('frontend/src/app/dashboard/layout.tsx', 'w') as f:
    f.write(content)
