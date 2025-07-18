# MSW Request Assertions

<div align="center">

A powerful testing library that provides custom assertion matchers for [Mock Service Worker (MSW)](https://mswjs.io/). Test your API interactions with confidence by asserting on request properties like headers, body, query parameters, and more.

![NPM](https://img.shields.io/npm/v/msw-request-assertions) ![GitHub CI](https://github.com/marklai1998/msw-request-assertions/actions/workflows/runTest.yml/badge.svg) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) [![npm type definitions](https://img.shields.io/npm/types/typescript.svg)](https://www.typescriptlang.org/)

[Features](#-features) | [Installation](#-installation) | [API](#-api) | [Contributing](#-contributing)

</div>

> [!IMPORTANT]  
> **Before using this library**, please read MSW's official guidance on [avoiding request assertions](https://mswjs.io/docs/best-practices/avoid-request-assertions). The MSW team recommends testing **how your application reacts** to requests rather than asserting on request details. This library should primarily be used for edge cases, like request details have no observable application behavior.

## ✨ Features

- ✅ Assert on any aspect of HTTP and GraphQL requests
- ✅ Works with Vitest and Jest

## 📦 Installation

```bash
npm install --save-dev msw-request-assertions msw
# or
yarn add --dev msw-request-assertions msw
# or
pnpm add --save-dev msw-request-assertions msw
```

## 🚀 Quick Start

### Setup for Vitest

```typescript
// vitest.setup.ts
import 'msw-request-assertions/vitest'
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

### Setup for Jest

> [!NOTE]  
> Jest support is not a first-class citizen due to complex setup requirements between ESM and CJS modules. While we provide Jest compatibility, our main development and testing efforts are focused on Vitest. Feel free to [raise an issue](https://github.com/marklai1998/msw-request-assertions/issues) if you encounter Jest-specific problems.

```typescript
// jest.setup.ts
import 'msw-request-assertions/jest'
```

```javascript
// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}
```

### Basic Example

```typescript
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// Create MSW handlers
const userHandler = http.post('/api/users', () => {
  return HttpResponse.json({ id: 1, name: 'John Doe' })
})

const server = setupServer(userHandler)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('should create user with correct data', async () => {
  const userData = { name: 'John Doe', email: 'john@example.com' }
  
  await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  })

  // Assert the request was made
  expect(userHandler).toHaveBeenRequested()
  
  // Assert the request body
  expect(userHandler).toHaveBeenRequestedWithJsonBody(userData)
  
  // Assert multiple properties at once
  expect(userHandler).toHaveBeenRequestedWith({
    jsonBody: userData,
    headers: { 'content-type': 'application/json' }
  })
})
```

## 💻 API

- [Basic Request Matchers](#basic-request-matchers)
    - [toHaveBeenRequested](#tohavebeenrequested)
    - [toHaveBeenRequestedTimes](#tohavebeenrequestedtimes)
- [Body Matchers](#body-matchers)
    - [toHaveBeenRequestedWithBody](#tohavebeenrequestedwithbody)
    - [toHaveBeenRequestedWithJsonBody](#tohavebeenrequestedwithjsonbody)
- [Header Matchers](#header-matchers)
    - [toHaveBeenRequestedWithHeaders](#tohavebeenrequestedwithheaders)
- [URL Matchers](#url-matchers)
    - [toHaveBeenRequestedWithQueryString](#tohavebeenrequestedwithquerystring)
    - [toHaveBeenRequestedWithHash](#tohavebeenrequestedwithhash)
    - [toHaveBeenRequestedWithPathParameters](#tohavebeenrequestedwithpathparameters)
- [GraphQL Matchers](#graphql-matchers)
    - [toHaveBeenRequestedWithGqlQuery](#tohavebeenrequestedwithgqlquery)
    - [toHaveBeenRequestedWithGqlVariables](#tohavebeenrequestedwithgqlvariables)
- [Unified Matcher](#unified-matcher)
    - [toHaveBeenRequestedWith](#tohavebeenrequestedwith)
- [Nth Call Matchers](#nth-call-matchers)
- [Types](#types)
    - [RequestPayload](#requestpayload)

### Basic Request Matchers

#### toHaveBeenRequested

Assert that a handler was called at least once.

```typescript
expect(handler).toHaveBeenRequested()
expect(handler).not.toHaveBeenRequested()
```

#### toHaveBeenRequestedTimes

Assert that a handler was called exactly n times.

```typescript
expect(handler).toHaveBeenRequestedTimes(3)
expect(handler).not.toHaveBeenRequestedTimes(1)
```

### Body Matchers

#### toHaveBeenRequestedWithBody

Assert on raw request body (string).

```typescript
expect(handler).toHaveBeenRequestedWithBody('name=John&email=john@example.com')

// Nth call variant
expect(handler).toHaveBeenNthRequestedWithBody(1, 'first call body')
```

#### toHaveBeenRequestedWithJsonBody

Assert on JSON request body (parsed object).

```typescript
expect(handler).toHaveBeenRequestedWithJsonBody({
  name: 'John Doe',
  email: 'john@example.com'
})

// Nth call variant
expect(handler).toHaveBeenNthRequestedWithJsonBody(2, { userId: '123' })
```

### Header Matchers

#### toHaveBeenRequestedWithHeaders

Assert on request headers. Headers are case-insensitive.

```typescript
expect(handler).toHaveBeenRequestedWithHeaders({
  'authorization': 'Bearer token123',
  'content-type': 'application/json'
})

// Nth call variant
expect(handler).toHaveBeenNthRequestedWithHeaders(1, { 'x-api-key': 'secret' })
```

### URL Matchers

#### toHaveBeenRequestedWithQueryString

Assert on URL query parameters.

> [!NOTE]  
> The input is a string to avoid serialization issues, especially with arrays and custom formats. This gives you full control over the exact query string format.

```typescript
expect(handler).toHaveBeenRequestedWithQueryString('?page=1&limit=10')
expect(handler).toHaveBeenRequestedWithQueryString('') // No query params

// Nth call variant
expect(handler).toHaveBeenNthRequestedWithQueryString(2, '?filter=active')

// Custom serialization with qs library
import qs from 'qs'

const params = {
  filters: ['active', 'verified'],
  sort: { field: 'name', order: 'asc' },
  page: 1
}

// Different serialization formats
const standardFormat = '?' + new URLSearchParams({ 
  'filters[]': 'active',
  'filters[]': 'verified' 
}).toString()

const qsFormat = '?' + qs.stringify(params, { 
  arrayFormat: 'brackets',
  encode: false 
})
// Results in: ?filters[]=active&filters[]=verified&sort[field]=name&sort[order]=asc&page=1

expect(handler).toHaveBeenRequestedWithQueryString(qsFormat)
```

#### toHaveBeenRequestedWithHash

Assert on URL hash fragment.

```typescript
expect(handler).toHaveBeenRequestedWithHash('#section1')

// Nth call variant
expect(handler).toHaveBeenNthRequestedWithHash(1, '#top')
```

#### toHaveBeenRequestedWithPathParameters

Assert on URL path parameters (for dynamic routes).

```typescript
// For route: /users/:userId/posts/:postId
expect(handler).toHaveBeenRequestedWithPathParameters({
  userId: '123',
  postId: '456'
})

// Nth call variant
expect(handler).toHaveBeenNthRequestedWithPathParameters(1, { id: '789' })
```

### GraphQL Matchers

#### toHaveBeenRequestedWithGqlQuery

Assert on GraphQL query string.

```typescript
expect(gqlHandler).toHaveBeenRequestedWithGqlQuery(`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
    }
  }
`)

// Nth call variant
expect(gqlHandler).toHaveBeenNthRequestedWithGqlQuery(1, 'query { users { id } }')
```

#### toHaveBeenRequestedWithGqlVariables

Assert on GraphQL variables.

```typescript
expect(gqlHandler).toHaveBeenRequestedWithGqlVariables({
  id: '123',
  filters: { status: 'active' }
})

// Nth call variant
expect(gqlHandler).toHaveBeenNthRequestedWithGqlVariables(2, { userId: '456' })
```

### Unified Matcher

#### toHaveBeenRequestedWith

Assert on multiple request properties at once. See [RequestPayload](#requestpayload) for all available properties.

```typescript
// HTTP example
expect(handler).toHaveBeenRequestedWith({
  jsonBody: { name: 'John' },
  headers: { 'authorization': 'Bearer token' },
  queryString: '?page=1',
  hash: '#top',
  pathParameters: { userId: '123' }
})

// GraphQL example
expect(gqlHandler).toHaveBeenRequestedWith({
  gqlQuery: 'query GetUser($id: ID!) { user(id: $id) { name } }',
  gqlVariables: { id: '123' }
})

// Nth call variant
expect(handler).toHaveBeenNthRequestedWith(2, {
  jsonBody: { action: 'update' },
  headers: { 'content-type': 'application/json' }
})
```

### Nth Call Matchers

All matchers have an "nth" variant to assert on specific call positions. The first argument is the call number (1-indexed).

```typescript
// Basic matchers
expect(handler).toHaveBeenNthRequestedWithBody(1, 'first call body')
expect(handler).toHaveBeenNthRequestedWithJsonBody(2, { data: 'second call' })
expect(handler).toHaveBeenNthRequestedWithHeaders(3, { 'x-retry': '2' })

// URL matchers
expect(handler).toHaveBeenNthRequestedWithQueryString(1, '?page=1')
expect(handler).toHaveBeenNthRequestedWithHash(2, '#section2')
expect(handler).toHaveBeenNthRequestedWithPathParameters(1, { id: '123' })

// GraphQL matchers
expect(gqlHandler).toHaveBeenNthRequestedWithGqlQuery(1, 'query { users }')
expect(gqlHandler).toHaveBeenNthRequestedWithGqlVariables(2, { limit: 10 })

// Unified matcher
expect(handler).toHaveBeenNthRequestedWith(3, {
  jsonBody: { name: 'Jane' },
  queryString: '?include=profile'
})
```

### Types

#### RequestPayload

The payload object used with `toHaveBeenRequestedWith` matcher.

```typescript
type RequestPayload = {
  // HTTP/GraphQL body content
  body?: string;
  jsonBody?: unknown;
  
  // HTTP headers (case-insensitive)
  headers?: Record<string, string>;
  
  // URL components
  queryString?: string;
  hash?: string;
  pathParameters?: Record<string, string>;
  
  // GraphQL specific
  gqlQuery?: string;
  gqlVariables?: unknown;
}
```

## 🤝 Contributing

### Development

#### Local Development

```bash
pnpm i
pnpm test
```

#### Build

```bash
pnpm build
```

### Release

This repo uses [Release Please](https://github.com/google-github-actions/release-please-action) to release.

#### To release a new version

1. Merge your changes into the `main` branch.
2. An automated GitHub Action will run, triggering the creation of a Release PR.
3. Merge the release PR.
4. Wait for the second GitHub Action to run automatically.
5. Congratulations, you're all set!
