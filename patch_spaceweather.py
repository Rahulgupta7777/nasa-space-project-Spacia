import os
import glob
import re

components_dir = 'src/app/spaceweather/components'
files = glob.glob(f'{components_dir}/**/*.tsx', recursive=True)

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # Headers
    content = content.replace('text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500', 'text-4xl font-bold text-space-text-heading')
    content = content.replace('text-2xl font-bold text-gray-100', 'text-2xl font-semibold text-space-text-heading')
    content = content.replace('text-2xl font-bold text-white', 'text-2xl font-semibold text-space-text-heading')
    content = content.replace('text-3xl font-bold text-white', 'text-2xl font-semibold text-space-text-heading')
    content = content.replace('text-xl font-bold text-white', 'text-xl font-semibold text-space-text-heading')
    content = content.replace('text-xl font-bold text-gray-100', 'text-xl font-semibold text-space-text-heading')
    content = content.replace('text-lg font-semibold text-white', 'text-lg font-semibold text-white')
    content = content.replace('text-lg font-bold text-gray-100', 'text-lg font-semibold text-white')

    # Card background and borders
    content = content.replace('bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6', 'rounded-lg border border-space-border bg-space-section p-6')
    content = content.replace('bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:bg-gray-800/50 transition-colors', 'rounded-lg border border-space-border bg-space-card p-6 transition-all hover:border-space-border-hover')
    content = content.replace('bg-gray-900/50 rounded-lg p-4 border border-gray-800', 'rounded-lg border border-space-border bg-space-card p-4 text-sm')
    content = content.replace('bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700', 'rounded-lg border border-space-border bg-space-section p-6')
    content = content.replace('bg-gray-800 rounded-xl border border-gray-700 overflow-hidden', 'rounded-lg border border-space-border bg-space-section overflow-hidden')
    content = content.replace('bg-gray-900/50 p-6', 'bg-space-card p-6')
    
    # Text colors
    content = re.sub(r'text-gray-300', 'text-space-text-main', content)
    content = re.sub(r'text-gray-400', 'text-space-text-muted', content)
    content = re.sub(r'text-gray-500', 'text-space-text-soft', content)
    content = re.sub(r'text-gray-100', 'text-white', content)
    
    # Specific elements
    content = content.replace('bg-gray-900', 'bg-space-card')
    content = content.replace('border-gray-800', 'border-space-border')
    content = content.replace('border-gray-700', 'border-space-border')
    content = content.replace('bg-gray-800', 'bg-space-section')
    content = content.replace('hover:bg-gray-700', 'hover:border-space-border-hover')

    with open(file, 'w') as f:
        f.write(content)

