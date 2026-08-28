import os

count = 0
for root, dirs, files in os.walk('backend/src/main/java'):
    for f in files:
        if f.endswith('.java'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as fh:
                content = fh.read()
            changed = False
            if 'columnDefinition = "jsonb"' in content:
                content = content.replace('columnDefinition = "jsonb"', 'columnDefinition = "text"')
                changed = True
            if 'columnDefinition = "uuid"' in content:
                content = content.replace('columnDefinition = "uuid"', 'columnDefinition = "varchar(36)"')
                changed = True
            if changed:
                with open(path, 'w', encoding='utf-8') as fh:
                    fh.write(content)
                count += 1

print(f"Cleaned column definitions in {count} files")
