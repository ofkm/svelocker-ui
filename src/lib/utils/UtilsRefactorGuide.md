# Utils Folder Refactoring

## Changes

- Consolidated authentication logic into `utils/api/auth.ts`
- Moved registry API calls to `utils/api/registry.ts`
- Moved formatting functions to `utils/formatting/`
- Added re-export files for easier imports

## How to Use

Import utilities like this:

```typescript
// New way to import
import { getDockerTags } from '$lib/utils/api/registry';
// Or with the index re-exports
import { getDockerTags } from '$lib/utils';
```
