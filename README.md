# Ajar

Ajar is an O(1) fetch client for APIs that implement the OpenAPI specification. It consumes a generic interface generated by [`openapi-typescript-codegen`](https://github.com/ferdikoomen/openapi-typescript-codegen) and returns a fully typed, deeply nested object that maps to fetch calls.

```ts
const client = Ajar<paths>()

client.feed.get()
client.user["500"].get()
client.posts.post()
```

Because it is implemented almost entirely using TypeScript's extensive type system, Ajar is largely capable of 'dissolving' during code compilation. In your app's bundle, all that remains is a lightweight core library that does not grow over time.

Currently, Ajar only implements a small subset of the OpenAPI specification, however it should be more than enough for almost every project.

## How it works

Ajar makes use of JavaScript proxies to create an infinitely nested object, and each entry exposes a number of methods. This roughly maps to:

```ts
type AjarObject = {
    [key: string]: AjarObject
    get: () => {}
    post: () => {}
    ...
}
```

This object is then artificially restricted to a set of known paths using the type system. This approach is advantageous because it means there is no runtime growth.

## Project status

Ajar is not currently usable. Almost all typing work has been completed, however the actual client is still a stub.

- [x] 🟦 Extract response from paths
- [x] 🟦 Generate basic chain type from a path
- [x] 🟦 Generate a complete chained type from the paths type
- [x] 🟨 Basic proxy
- [x] 🟦 Support parameters in the chained type  
- [ ] 🟨 Create basic fetch client inside the proxy callback
- [ ] 🟦 Type response

## Credits

This project was heavily inspired by the [hono client](https://github.com/honojs/hono) which pioneered our usage of proxies.

---

It all started with a message: 

![](/assets/challenge.png)

In the [SolidJS](https://discord.gg/solidjs) discord, BTW ;)