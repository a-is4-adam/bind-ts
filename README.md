# @bind

**Headless UI for building type-safe compound components.** Stop writing repetitive context boilerplate for tabs, accordions, wizards, and other UI patterns that need "one active item at a time" logic. Framework agnostic with first-class React support.

Built on top of [@tanstack/store](https://tanstack.com/store), heavily inspired by [@tanstack/form](https://tanstack.com/form).

## Packages

| Package                                                | Description                                    |
| ------------------------------------------------------ | ---------------------------------------------- |
| [`@bind-ts/react-bind`](packages/react-bind/README.md) | React bindings with hooks and components       |
| `@bind-ts/bind-core`                                   | Framework-agnostic core with `@tanstack/store` |

## Installation

```bash
npm install @bind-ts/react-bind
```

See the [@bind-ts/react-bind README](packages/react-bind/README.md) for full documentation and usage examples.

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Bun](https://bun.sh/) (recommended for faster installs)

### Getting Started

1. Clone the repository:

```bash
git clone https://github.com/your-username/bind.git
cd bind
```

2. Install dependencies:

```bash
bun install
```

3. Build all packages:

```bash
bun run build
```

4. Run tests:

```bash
bun run test
```

5. Start the development server (example app):

```bash
bun run dev
```

### Project Structure

```
bind/
├── packages/
│   ├── bind-core/      # Framework-agnostic core
│   └── react-bind/     # React bindings
├── apps/
│   └── web/            # Example Next.js app
└── docs/               # Documentation examples
```

## License

MIT

## Attribution

Huge shoutout to the maintainers over at [Tanstack](https://tanstack.com/), espically those working on [Tanstack Store](https://tanstack.com/store/latest) and [Tanstack Form](https://tanstack.com/form/latest). Using their codebases as the learning material for this project was invaluable. I've always been curious about how these libraries work under the hood and I'm grateful for the opportunity to learn from them.
