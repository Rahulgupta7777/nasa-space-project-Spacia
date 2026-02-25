import re

with open('src/components/LaunchPlanner.tsx', 'r') as f:
    content = f.read()

# Headers
content = content.replace('<h1 className="text-3xl sm:text-4xl font-bold">Launch Planner</h1>', '<h1 className="text-4xl font-bold text-space-text-heading">Launch Planner</h1>')
content = content.replace('<p className="mt-2 text-slate-300">', '<p className="mt-4 max-w-3xl leading-relaxed text-space-text-main">')

# Backgrounds and borders
content = content.replace('glass-panel rounded-lg border border-slate-800/60 p-5', 'rounded-lg border border-space-border bg-space-section p-6')
content = content.replace('glass-panel rounded-xl border border-slate-800/60 p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/30', 'rounded-lg border border-space-border bg-space-section p-6')
content = content.replace('bg-slate-900/40 border border-slate-700', 'bg-space-card border border-space-border focus:border-space-border-hover outline-none text-white')
content = content.replace('border-slate-700/50', 'border-space-border')
content = content.replace('border-slate-800/60', 'border-space-border')
content = content.replace('bg-slate-800/30', 'bg-space-card')
content = content.replace('bg-slate-950/60', 'bg-space-section')

# Buttons
content = content.replace('button-primary', 'px-6 py-2.5 bg-white text-black font-medium rounded hover:bg-gray-200 transition')

# Text colors
content = re.sub(r'text-slate-100', 'text-white', content)
content = re.sub(r'text-slate-200', 'text-white', content)
content = re.sub(r'text-slate-300', 'text-space-text-main', content)
content = re.sub(r'text-slate-400', 'text-space-text-muted', content)
content = re.sub(r'text-slate-500', 'text-space-text-muted', content)
content = re.sub(r'text-slate-600', 'text-space-text-muted', content)
content = re.sub(r'text-slate-50', 'text-white', content)

# Section wrapper
content = content.replace('<section className="mx-auto max-w-6xl px-4 py-10">', '<section className="mx-auto max-w-6xl px-4 py-12 text-space-text-main">')

with open('src/components/LaunchPlanner.tsx', 'w') as f:
    f.write(content)
