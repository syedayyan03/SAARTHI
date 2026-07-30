file_path = r"D:\cmtcrw (1)\cmtcrw\public\index.html"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# We want to find the second occurrence of '<div class="google-login-separator">'
occ_count = 0
line_to_remove = -1

for idx, line in enumerate(lines):
    if 'class="google-login-separator"' in line:
        occ_count += 1
        if occ_count == 2:
            line_to_remove = idx
            break

if line_to_remove != -1:
    del lines[line_to_remove]
    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(lines)
    print("SUCCESS: Redundant OR line removed successfully!")
else:
    print("ERROR: Second OR separator line not found!")
