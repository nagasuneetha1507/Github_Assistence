export const MOCK_REPOSITORIES = {
  "expressjs/express": {
    owner: "expressjs",
    repo: "express",
    full_name: "expressjs/express",
    description: "Fast, unopinionated, minimalist web framework for Node.js",
    stars: 64800,
    forks: 14200,
    open_issues: 120,
    language: "JavaScript",
    license: "MIT",
    default_branch: "master",
    updated_at: "2026-07-28T14:22:00Z",
    topics: ["express", "node", "web-framework", "javascript", "http", "rest-api"],
    tech_stack: {
      category: "Backend Web Framework",
      architecture: "Middleware Pipeline (Chain of Responsibility)",
      primary_language: "JavaScript (Node.js)",
      frameworks: ["Node.js HTTP Server"],
      dependencies: ["body-parser", "cookie", "debug", "finalhandler", "router", "send", "serve-static"],
      test_tools: ["mocha", "supertest", "nyc"],
      database: "Agnostic (Integrates with MongoDB, PostgreSQL, Redis, etc.)"
    },
    summary: "Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It simplifies building HTTP servers by providing a modular middleware architecture, routing mechanisms, and template engine integration.",
    entry_points: [
      { path: "index.js", role: "Main Library Export", description: "Re-exports application creator from lib/express.js" },
      { path: "lib/express.js", role: "Framework Core Factory", description: "Creates express application instances and exports Router & Middleware helpers" },
      { path: "lib/application.js", role: "Application Prototype", description: "Contains app.listen(), app.use(), app.route(), and engine registrations" },
      { path: "lib/router/index.js", role: "Request Dispatcher", description: "Core routing engine handling middleware stack execution and route matching" }
    ],
    architecture_nodes: [
      { id: "entry", label: "Entry Point (index.js)", type: "entry", description: "Application bootstrapper and module export interface." },
      { id: "app", label: "Express App Prototype (application.js)", type: "core", description: "Manages server lifecycle, settings, and top-level middleware registration." },
      { id: "router", label: "Router Engine (router/index.js)", type: "router", description: "Matches HTTP method + URL path and executes middleware stack." },
      { id: "middleware", label: "Middleware Layer (router/layer.js)", type: "middleware", description: "Handles error handling, authentication, body parsing, and logging." },
      { id: "req_res", label: "Request / Response Wrappers (request.js / response.js)", type: "util", description: "Extends native Node.js HTTP req/res with helper methods like res.json() and res.send()." }
    ],
    architecture_edges: [
      { from: "entry", to: "app", label: "instantiates" },
      { from: "app", to: "router", label: "delegates requests to" },
      { from: "router", to: "middleware", label: "executes sequentially" },
      { from: "middleware", to: "req_res", label: "enhances context" }
    ],
    health_score: 92,
    audit_findings: [
      {
        id: "AUD-01",
        type: "Security & Practice",
        severity: "Medium",
        title: "Modern ES Module Wrapper Recommended",
        description: "The codebase uses CommonJS (require/module.exports). Adding explicit ESM export wrappers or package.json type: module support improves modern bundler tree-shaking.",
        fix_snippet: `// Recommended package.json modification
{
  "name": "express",
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.js"
    }
  }
}`
      },
      {
        id: "AUD-02",
        type: "Documentation",
        severity: "Low",
        title: "Missing OpenAPI / Swagger Specs in Root",
        description: "Adding an OpenAPI 3.0 specification template in the root directory helps third-party generators produce instant client SDKs.",
        fix_snippet: `# openapi.yaml example
openapi: 3.0.0
info:
  title: Express Application API
  version: 1.0.0`
      }
    ],
    file_tree: [
      { path: "index.js", type: "file", size: 220 },
      { path: "lib/express.js", type: "file", size: 3450 },
      { path: "lib/application.js", type: "file", size: 14200 },
      { path: "lib/request.js", type: "file", size: 9800 },
      { path: "lib/response.js", type: "file", size: 18500 },
      { path: "lib/router/index.js", type: "file", size: 16400 },
      { path: "lib/router/layer.js", type: "file", size: 4200 },
      { path: "lib/router/route.js", type: "file", size: 5800 },
      { path: "lib/middleware/init.js", type: "file", size: 1400 },
      { path: "lib/middleware/query.js", type: "file", size: 1200 },
      { path: "package.json", type: "file", size: 2400 },
      { path: "README.md", type: "file", size: 8500 }
    ],
    sample_files: {
      "index.js": `'use strict';

module.exports = require('./lib/express');
`,
      "lib/express.js": `'use strict';

/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;
var mixin = require('merge-descriptors');
var proto = require('./application');
var Route = require('./router/route');
var Router = require('./router');

/**
 * Expose \`createApplication()\`.
 */

exports = module.exports = createApplication;

/**
 * Create an express application.
 *
 * @return {Function}
 * @api public
 */

function createApplication() {
  var app = function(req, res, next) {
    app.handle(req, res, next);
  };

  mixin(app, EventEmitter.prototype, false);
  mixin(app, proto, false);

  // expose the prototype that will get set on requests
  app.request = { __proto__: req, app: app };

  // expose the prototype that will get set on responses
  app.response = { __proto__: res, app: app };

  app.init();
  return app;
}

/**
 * Expose constructors.
 */

exports.application = proto;
exports.request = req;
exports.response = res;
exports.Route = Route;
exports.Router = Router;
`,
      "package.json": `{
  "name": "express",
  "description": "Fast, unopinionated, minimalist web framework",
  "version": "4.19.2",
  "author": "TJ Holowaychuk <tj@vision-media.ca>",
  "contributors": [
    "Douglas Christopher Wilson <doug@somethingdoug.com>",
    "StrongLoop <callback@strongloop.com>"
  ],
  "license": "MIT",
  "repository": "expressjs/express",
  "main": "index.js",
  "dependencies": {
    "accepts": "~1.3.8",
    "array-flatten": "1.1.1",
    "body-parser": "1.20.2",
    "content-disposition": "0.5.4",
    "cookie": "0.6.0",
    "debug": "2.6.9",
    "encodeurl": "~1.0.2",
    "escape-html": "~1.0.3",
    "etag": "~1.8.1",
    "finalhandler": "1.2.0",
    "fresh": "0.5.2",
    "http-errors": "2.0.0",
    "merge-descriptors": "1.0.1",
    "methods": "~1.1.2",
    "on-finished": "2.4.1",
    "parseurl": "~1.3.3",
    "path-to-regexp": "0.1.7",
    "proxy-addr": "~2.0.7",
    "qs": "6.11.0",
    "range-parser": "~1.2.1",
    "safe-buffer": "5.2.1",
    "send": "0.18.0",
    "serve-static": "1.15.0",
    "type-is": "~1.6.18",
    "utils-merge": "1.0.1",
    "vary": "~1.1.2"
  }
}`
    }
  },
  "pmndrs/zustand": {
    owner: "pmndrs",
    repo: "zustand",
    full_name: "pmndrs/zustand",
    description: "🐻 Bear necessities for state management in React",
    stars: 43200,
    forks: 1400,
    open_issues: 28,
    language: "TypeScript",
    license: "MIT",
    default_branch: "main",
    updated_at: "2026-08-01T09:10:00Z",
    topics: ["react", "state-management", "typescript", "zustand", "hooks", "redux-alternative"],
    tech_stack: {
      category: "Frontend State Management Library",
      architecture: "Publish/Subscribe Store with React Sync External Store Hook",
      primary_language: "TypeScript",
      frameworks: ["React"],
      dependencies: ["use-sync-external-store"],
      test_tools: ["vitest", "testing-library"],
      database: "N/A (Client State)"
    },
    summary: "Zustand is a small, fast, and scalable bear-bones state management solution using simplified flux principles. It has a comfy API based on hooks, doesn't boilerplate or wrap your app in providers, and handles transient updates cleanly without unnecessary re-renders.",
    entry_points: [
      { path: "src/index.ts", role: "Primary Export", description: "Exports create() hook and createStore() core engine" },
      { path: "src/vanilla.ts", role: "Vanilla JS Core Store", description: "Framework-agnostic state store implementation with getState, setState, and subscribe" },
      { path: "src/react.ts", role: "React Hook Integration", description: "Binds vanilla store to React using useSyncExternalStoreWithSelector" },
      { path: "src/middleware.ts", role: "Middleware Ecosystem", description: "Includes persist, devtools, combine, and subscribeWithSelector middleware" }
    ],
    architecture_nodes: [
      { id: "vanilla", label: "Vanilla Store (src/vanilla.ts)", type: "core", description: "Pure JS state store holding state object and listener callbacks set." },
      { id: "react_hook", label: "React Adapter (src/react.ts)", type: "router", description: "Connects store updates to React component lifecycle via useSyncExternalStore." },
      { id: "middleware", label: "Middleware Wrappers (src/middleware.ts)", type: "middleware", description: "Enhances setState calls with localStorage persistence, devtools logging, and state transformations." }
    ],
    architecture_edges: [
      { from: "react_hook", to: "vanilla", label: "subscribes & reads" },
      { from: "middleware", to: "vanilla", label: "wraps setState / getState" }
    ],
    health_score: 97,
    audit_findings: [
      {
        id: "AUD-01",
        type: "Code Quality",
        severity: "Low",
        title: "Strict Null Checks Enabled",
        description: "Repository has excellent 99% test coverage and strict TypeScript strictness flags.",
        fix_snippet: `// Exemplary tsconfig.json configuration detected
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}`
      }
    ],
    file_tree: [
      { path: "src/index.ts", type: "file", size: 320 },
      { path: "src/vanilla.ts", type: "file", size: 2800 },
      { path: "src/react.ts", type: "file", size: 1900 },
      { path: "src/middleware.ts", type: "file", size: 8400 },
      { path: "src/middleware/persist.ts", type: "file", size: 6200 },
      { path: "src/middleware/devtools.ts", type: "file", size: 4500 },
      { path: "package.json", type: "file", size: 1800 },
      { path: "README.md", type: "file", size: 12000 }
    ],
    sample_files: {
      "src/index.ts": `export * from './vanilla.js'
export * from './react.js'
export { create as default } from './react.js'
`,
      "src/vanilla.ts": `type SetStateInternal<T> = {
  (
    partial: T | Partial<T> | ((state: T) => T | Partial<T>),
    replace?: boolean | undefined
  ): void
}

export interface StoreApi<T> {
  setState: SetStateInternal<T>
  getState: () => T
  getInitialState: () => T
  subscribe: (listener: (state: T, prevState: T) => void) => () => void
}

export const createStoreImpl = <T>(
  createState: (set: StoreApi<T>['setState'], get: StoreApi<T>['getState'], api: StoreApi<T>) => T
): StoreApi<T> => {
  type Listener = (state: T, prevState: T) => void
  let state: T
  const listeners: Set<Listener> = new Set()

  const setState: StoreApi<T>['setState'] = (partial, replace) => {
    const nextState =
      typeof partial === 'function'
        ? (partial as (state: T) => T | Partial<T>)(state)
        : partial
    if (!Object.is(nextState, state)) {
      const previousState = state
      state =
        replace ?? (typeof nextState !== 'object' || nextState === null)
          ? (nextState as T)
          : Object.assign({}, state, nextState)
      listeners.forEach((listener) => listener(state, previousState))
    }
  }

  const getState: StoreApi<T>['getState'] = () => state
  const getInitialState: StoreApi<T>['getState'] = () => initialState

  const subscribe: StoreApi<T>['subscribe'] = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const api = { setState, getState, getInitialState, subscribe }
  const initialState = (state = createState(setState, getState, api))
  return api
}

export const createStore = (createState) =>
  createState ? createStateImpl(createState) : createStoreImpl
`
    }
  },
  "fastapi/fastapi": {
    owner: "fastapi",
    repo: "fastapi",
    full_name: "fastapi/fastapi",
    description: "FastAPI framework, high performance, easy to learn, fast to code, ready for production",
    stars: 76500,
    forks: 6300,
    open_issues: 85,
    language: "Python",
    license: "MIT",
    default_branch: "master",
    updated_at: "2026-08-02T16:45:00Z",
    topics: ["python", "api", "rest", "asyncio", "openapi", "pydantic", "starlette"],
    tech_stack: {
      category: "Python Web API Framework",
      architecture: "ASGI (Asynchronous Server Gateway Interface) & Pydantic Data Validation",
      primary_language: "Python 3.8+",
      frameworks: ["Starlette", "Pydantic"],
      dependencies: ["starlette", "pydantic", "typing-extensions"],
      test_tools: ["pytest", "pytest-asyncio"],
      database: "Agnostic (Integrates with SQLAlchemy, SQLModel, Tortoise ORM, Mongo Engine)"
    },
    summary: "FastAPI is a modern, fast (high-performance), web framework for building APIs with Python standard type hints. It achieves automatic OpenAPI documentation generation, high speed comparable to NodeJS and Go (thanks to Starlette & Pydantic), and seamless asynchronous request handling.",
    entry_points: [
      { path: "fastapi/applications.py", role: "FastAPI App Engine", description: "Main FastAPI class managing routing, OpenAPI schema generation, and exception handlers" },
      { path: "fastapi/routing.py", role: "APIRouter & Route Dispatcher", description: "Handles path matching, dependency injection, and Pydantic request body validation" },
      { path: "fastapi/params.py", role: "Parameter Definitions", description: "Defines Query, Path, Body, Header, Cookie, and Depends specifiers" },
      { path: "fastapi/datastructures.py", role: "Data Types & Wrappers", description: "Custom responses, UploadFile, and State objects" }
    ],
    architecture_nodes: [
      { id: "app", label: "FastAPI Class (applications.py)", type: "entry", description: "Inherits Starlette ASGI app. Manages routes, middleware, and OpenAPI configuration." },
      { id: "router", label: "APIRouter (routing.py)", type: "router", description: "Parses path parameters, evaluates dependency injection tree, and invokes endpoint functions." },
      { id: "pydantic", label: "Pydantic Validation (param_functions.py)", type: "middleware", description: "Validates incoming JSON bodies and query parameters against type annotations." },
      { id: "openapi", label: "OpenAPI Generator (openapi/utils.py)", type: "util", description: "Inspects route decorators and Pydantic models to automatically build Swagger UI & ReDoc docs." }
    ],
    architecture_edges: [
      { from: "app", to: "router", label: "includes routes from" },
      { from: "router", to: "pydantic", label: "validates payload via" },
      { from: "router", to: "openapi", label: "extracts schema for" }
    ],
    health_score: 96,
    audit_findings: [
      {
        id: "AUD-01",
        type: "Performance",
        severity: "Low",
        title: "Uvicorn Loop Optimization",
        description: "For maximum production concurrency, ensure standard installation includes uvloop & httptools extensions.",
        fix_snippet: `# Run with optimized event loop
uvicorn main:app --host 0.0.0.0 --port 8000 --loop uvloop --http httptools`
      }
    ],
    file_tree: [
      { path: "fastapi/__init__.py", type: "file", size: 450 },
      { path: "fastapi/applications.py", type: "file", size: 18500 },
      { path: "fastapi/routing.py", type: "file", size: 32000 },
      { path: "fastapi/param_functions.py", type: "file", size: 12400 },
      { path: "fastapi/exceptions.py", type: "file", size: 3100 },
      { path: "fastapi/openapi/utils.py", type: "file", size: 14200 },
      { path: "pyproject.toml", type: "file", size: 3400 },
      { path: "README.md", type: "file", size: 16000 }
    ],
    sample_files: {
      "fastapi/__init__.py": `"""FastAPI framework, high performance, easy to learn, fast to code, ready for production"""

__version__ = "0.111.0"

from .applications import FastAPI as FastAPI
from .routing import APIRouter as APIRouter
from .params import Body as Body, Depends as Depends, Path as Path, Query as Query
from .exceptions import HTTPException as HTTPException
`,
      "fastapi/applications.py": `from typing import Any, Callable, Dict, List, Optional, Sequence, Type, Union
from starlette.applications import Starlette
from fastapi.routing import APIRouter

class FastAPI(Starlette):
    def __init__(
        self,
        *,
        title: str = "FastAPI",
        description: str = "",
        version: str = "0.1.0",
        openapi_url: Optional[str] = "/openapi.json",
        docs_url: Optional[str] = "/docs",
        redoc_url: Optional[str] = "/redoc",
    ):
        super().__init__()
        self.title = title
        self.description = description
        self.version = version
        self.openapi_url = openapi_url
        self.docs_url = docs_url
        self.redoc_url = redoc_url
        self.router: APIRouter = APIRouter()
`
    }
  }
};
