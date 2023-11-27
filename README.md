# async-dependency-injection

This is a small, no-dependency library for dependency injection in node.js projects.
It uses [node's `AsyncLocalStorage`](https://nodejs.org/api/async_context.html) to provide dependencies in a scoped manner.
It leverages Typescript to ensure type safety.

## Usage

### 1. Create a container

```typescript
import { createContainer, type } from "async-dependency-injection";

const container = createContainer({
    logger: type<(message: string) => void>(),
    name: type<string>(),
    counter: type<number>(),
});
```

You create your container by calling `createContainer` with a map of dependencies.
The map specifies the names and types of the dependencies. The type can be anything.
The dependency names can be strings or symbols.

### 2. Create a runner

```typescript
let counter = 0;
const provider = container
    .provider()
    .constant("logger", () => console.log)
    .singleton("name", () => "world")
    .factory("counter", () => counter++);

const runner = provider.create();
```

You create a runner by creating a provider which provides all the dependencies.
Only when all dependencies are provided can you call `provider.create()` to create a runner.
This is enforced on the type level as well as at runtime.

As you can see in the example above, there are three ways to provide dependencies:

-   `constant` provides a constant value. It will not change for subsequent calls.
-   `singleton` provides a value which is created once (on first use) and then cached.
-   `factory` provides a value which is created every time it is used.

You should be aware that a singleton provider will be called once for every run you start with the runner,
so it is a singleton only within the scope of one run.

A container can have many different providers.

### 3. Use the runner

```typescript
const program = () => {
    const logger = container.use("logger");
    const name = container.use("name");

    logger(`hello ${name} ${container.use("counter")}!`);
    logger(`hello ${name} ${container.use("counter")}!`);

    return "done";
};

const result = runner.run(program);
console.log(result);
```

You use the runner by calling `runner.run` with a function. The function can be asynchronous, as `AsyncLocalStorage`
tracks the execution context across asynchronous calls. The runner will return whatever your function returns.

The above example would therefore print:

```
hello world 0!
hello world 1!
done
```

### Usage with run configuration

A provider can also have a run configuration, e.g. if you want to provide information about a request context.

```typescript
import { createContainer, type } from "async-dependency-injection";

const container = createContainer({
    logger: type<{ info: (message: string) => void }>(),
});

class LoggerWithIP {
    private readonly userIP: string;
    constructor({ userIP }: { userIP: string }) {
        this.userIP = userIP;
    }

    info(message: string) {
        console.info(`[${this.userIP}] ${message}`);
    }
}

const runner = container
    .provider<{ userIP: string }>()
    .singleton("logger", (config) => new LoggerWithIP(config))
    .create();

const program = () => {
    const logger = container.use("logger");
    logger.info("hello world");
};

runner.run(program, { userIP: "192.168.0.5" });
runner.run(program, { userIP: "205.123.42.9" });
```

which would print

```
[192.168.0.5] hello world
[205.123.42.9] hello world
```
