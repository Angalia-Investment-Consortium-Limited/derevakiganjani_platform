import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# We want to find all <Route path="/admin..." element={<AdminRoleBasedRoute> ... </AdminRoleBasedRoute>} />
# and group them. Wait, some are <Route path="/admin..." element={<AdminRoleBasedRoute>\n  <Component />\n</AdminRoleBasedRoute>} />

route_pattern = re.compile(r'(<Route\s+path="/admin(?:/[^"]*)?"\s+element=\{[\s\S]*?</AdminRoleBasedRoute>\s*\}\s*/>)')
admin_routes = route_pattern.findall(content)

# Remove all admin_routes from content
new_content = content
for route in admin_routes:
    new_content = new_content.replace(route, '')

# Now let's format the nested routes
nested_routes = []
for route in admin_routes:
    # replace path="/admin/something" with path="something"
    # if path="/admin", replace with index
    path_match = re.search(r'path="/admin/?([^"]*)"', route)
    if path_match:
        sub_path = path_match.group(1)
        if sub_path == "":
            modified_route = re.sub(r'path="/admin"', 'index', route)
        else:
            modified_route = re.sub(r'path="/admin/?([^"]*)"', f'path="{sub_path}"', route)
        nested_routes.append(modified_route)

# Also there might be admin routes that don't use AdminRoleBasedRoute?
# Looking at App.tsx, they all seem to use AdminRoleBasedRoute.

admin_routes_block = '<Route path="/admin" element={<AdminLayoutRoot />}>\n'
for r in nested_routes:
    # indent
    indented = '\n'.join(['              ' + line for line in r.split('\n')])
    admin_routes_block += indented + '\n'
admin_routes_block += '            </Route>'

# Insert the block before <Route path="*" element={<NotFound />} />
new_content = new_content.replace('<Route path="*" element={<NotFound />} />', admin_routes_block + '\n              <Route path="*" element={<NotFound />} />')

# Add import for AdminLayoutRoot
if 'AdminLayoutRoot' not in new_content:
    new_content = new_content.replace('import CVView from "./pages/cv/CVView";', 'import CVView from "./pages/cv/CVView";\nimport { AdminLayoutRoot } from "./components/admin/AdminLayoutRoot";')

with open('src/App.tsx', 'w') as f:
    f.write(new_content)

print("Refactored App.tsx")
