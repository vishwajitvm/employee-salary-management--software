import sys

with open('frontend/src/app/employee-portal/page.tsx', 'r') as f:
    content = f.read()

# I need to wrap the main component. I will rename EmployeePortal to EmployeePortalContent
# and then create a new default export EmployeePortal that wraps it in <Suspense>

content = content.replace("export default function EmployeePortal() {", "function EmployeePortalContent() {")

suspense_wrapper = """
import { Suspense } from 'react';

export default function EmployeePortal() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><Loader2 className="w-12 h-12 text-indigo-600 animate-spin" /></div>}>
      <EmployeePortalContent />
    </Suspense>
  );
}
"""

content = content + "\n" + suspense_wrapper

with open('frontend/src/app/employee-portal/page.tsx', 'w') as f:
    f.write(content)
