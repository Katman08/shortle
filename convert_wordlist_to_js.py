import sys

if len(sys.argv) < 3:
    print('Usage: python convert_wordlist_to_js.py <input.txt> <output.js>')
    sys.exit(1)

input_path = sys.argv[1]
output_path = sys.argv[2]

with open(input_path, 'r', encoding='utf-8') as f:
    words = [line.strip() for line in f if line.strip()]

js_content = 'export default [\n' + ',\n'.join(f'  "{w}"' for w in words) + '\n];\n'

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f'Converted {input_path} to {output_path}') 