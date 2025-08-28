# Docker is OK, but if you want to go further you should consider Nix

Docker has become the de‑facto standard for containerization, but it has some limitations when it comes to reproducibility, declarative configuration, and multi‑platform builds. Nix, a purely functional package manager, offers a different approach that can address many of Docker’s pain points.

## 1. Declarative, Reproducible Builds

- **Docker**: Dockerfiles are imperative. You write a sequence of commands, and the resulting image depends on the state of the host at build time. Small changes in the environment can lead to different images.
- **Nix**: Packages are defined in a purely functional language. The same `default.nix` will always produce the same binary, regardless of the host. This guarantees reproducibility across CI, production, and local development.

## 2. Immutable, Reproducible Environments

- **Docker**: Images are layered. Each layer is immutable, but the overall image can still contain hidden state (e.g., cached files, environment variables).
- **Nix**: Every dependency is stored in a hash‑based store (`/nix/store`). The store is immutable, and the entire environment is a snapshot that can be rolled back or shared.

## 3. Multi‑Platform Support

- **Docker**: Building for ARM, x86, or other architectures requires cross‑compilation or emulation. Docker Buildx helps, but it’s still an extra step.
- **Nix**: Nix can build packages for multiple platforms from the same source tree using `cross` or `multi` builds. The resulting binaries are deterministic and can be deployed anywhere.

## 4. Fine‑Grained Dependency Management

- **Docker**: Dependencies are pulled from registries or built from scratch. You have limited control over the exact versions of system libraries.
- **Nix**: Every dependency, including system libraries, is versioned and pinned. You can specify exact versions or use the latest, and Nix will resolve the entire dependency graph for you.

## 5. Integration with Docker

You don’t have to abandon Docker. Nix can build Docker images:

