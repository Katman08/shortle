input_path = 'answer_list.js'
output_path = 'answer_list_no_newlines.js'

with open(input_path, 'r', encoding='utf-8') as f:
    content = f.read()

no_newlines = content.replace('\n', '')

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(no_newlines)

print(f'Removed newlines from {input_path} and wrote to {output_path}') 