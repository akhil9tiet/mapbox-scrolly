# Mapbox Scrolly - Project Structure

This project follows a modular, scalable architecture using React Context API, reducers, and immutability patterns with Immer.

## Folder Structure

```
src/
├── context/              # State management using Context API
│   └── store/           # Main store context
│       ├── actions.ts   # Action creators
│       ├── reducer.ts   # Reducer with immer
│       ├── context.ts   # Context provider
│       ├── useStore.ts  # Hook to access store
│       └── index.ts     # Barrel export
├── hooks/               # Custom hooks
│   ├── useActions.ts    # Hook for dispatching actions
│   ├── sideEffects/     # Hooks for API calls and async operations
│   │   ├── useFetchData.ts
│   │   └── index.ts
│   └── index.ts         # Barrel export
├── components/          # React components
│   ├── common/          # Shared components used across the app
│   │   ├── Button/
│   │   ├── Container/
│   │   └── index.ts
│   ├── MapViewer/       # Story-specific components
│   └── index.ts
├── App.tsx
├── App.css
├── index.tsx
└── index.css
```

## How It Works

### State Management

1. **Actions** (`context/store/actions.ts`): Define all possible actions that can modify the state
2. **Reducer** (`context/store/reducer.ts`): Pure function that handles state transitions using Immer for immutability
3. **Context** (`context/store/context.ts`): Provides state and dispatch to components
4. **Hook** (`context/store/useStore.ts`): Custom hook to access the store

### Components

- **Common Components** (`components/common/`): Reusable UI components like Button, Container
- **Story Components** (`components/`): Feature-specific components like MapViewer
- Each component is in its own folder with `index.ts` for clean imports

### Hooks

- **useActions** (`hooks/useActions.ts`): Dispatch actions to the store
- **useFetchData** (`hooks/sideEffects/useFetchData.ts`): Example hook for API calls with loading/error states

## Usage Examples

### Accessing State

```typescript
import { useStore } from './context/store';

export const MyComponent = () => {
  const { state } = useStore();
  return <div>{state.data}</div>;
};
```

### Dispatching Actions

```typescript
import { useActions } from './hooks';

export const MyComponent = () => {
  const { setData, setLoading } = useActions();
  
  const handleClick = () => {
    setLoading(true);
    // fetch data...
    setData(newData);
  };
  
  return <button onClick={handleClick}>Load Data</button>;
};
```

### Using API Hooks

```typescript
import { useFetchData } from './hooks';

export const MyComponent = () => {
  const { data, isLoading, error } = useFetchData('/api/data');
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{data}</div>;
};
```

## Adding New Features

### 1. Create New Actions
Add to `context/store/actions.ts`:
```typescript
myNewAction: (payload: any) => ({
  type: 'MY_NEW_ACTION' as const,
  payload,
})
```

### 2. Update Reducer
Add to `context/store/reducer.ts`:
```typescript
case 'MY_NEW_ACTION':
  draft.myField = action.payload;
  break;
```

### 3. Create Hook Helper
Add to `hooks/useActions.ts`:
```typescript
myNewAction: (payload: any) => {
  dispatch(storeActions.myNewAction(payload));
}
```

### 4. Use in Components
```typescript
const { myNewAction } = useActions();
myNewAction(value);
```

## Key Benefits

- **Immutability**: Immer makes immutable updates easy and safe
- **Type Safety**: Full TypeScript support throughout
- **Scalability**: Easy to add new features and components
- **Maintainability**: Clear separation of concerns
- **Testability**: Pure functions and hooks are testable (if needed)
- **Performance**: Context splitting can be done per feature slice if needed
