# TypeScript Types Directory

This directory will contain auto-generated TypeScript type definitions for Frappe DocTypes.

## Setup

To enable automatic type generation:

1. Open Frappe Desk and search for "Type Generation Settings"
2. Add a new row with:
   - **App Name**: `derevahuduma_platform`
   - **Path**: `apps/derevahuduma_platform/landing/src/types`
3. Save the settings

## Usage

After configuration, whenever you create or update a DocType in Frappe, the `frappe_types` app will automatically generate corresponding TypeScript interfaces in this directory.

The generated types will be organized by module:
```
types/
  ├── ModuleName/
  │   ├── DocTypeName.ts
  │   └── ChildTableName.ts
  └── ...
```

## Manual Type Generation

You can also generate types manually using the bench CLI:

```bash
# Generate types for a specific DocType
bench --site derevakiganjani.mdvfleet.co.tz generate-types-for-doctype --app derevahuduma_platform --doctype "DocType Name"

# Generate types for an entire module
bench --site derevakiganjani.mdvfleet.co.tz generate-types-for-module --app derevahuduma_platform --module "Module Name"
```

## Example Usage in Code

```typescript
import { User } from './types/Core/User';

const user: User = {
  name: 'user@example.com',
  email: 'user@example.com',
  first_name: 'John',
  // ... other fields with type safety
};
