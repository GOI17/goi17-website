---
title:
  en: "Docker is OK, but if you want to go further you should consider Nix"
  es: "Docker está bien, pero si quieres ir más allá deberías considerar Nix"
excerpt:
  en: "Docker has become the de‑facto standard for containerization, but it has limitations in reproducibility, declarative configuration, and multi‑platform builds. Nix, a purely functional package manager, offers a different approach that can address many of Docker’s pain points."
  es: "Docker se ha convertido en el estándar de facto para la contenedorización, pero tiene limitaciones en reproducibilidad, configuración declarativa y compilaciones multiplataforma. Nix, un gestor de paquetes puramente funcional, ofrece un enfoque diferente que puede abordar muchos de los puntos débiles de Docker."
---

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

You don't have to abandon Docker. Nix can build Docker images using tools like `dockerTools` in Nixpkgs:

```nix
# Example: Building a Docker image with Nix
{ pkgs ? import <nixpkgs> {} }:

pkgs.dockerTools.buildImage {
  name = "my-app";
  tag = "latest";

  copyToRoot = [
    (pkgs.buildEnv {
      name = "app-env";
      paths = [ pkgs.nodejs-18_x ];
    })
  ];

  config = {
    Cmd = [ "/bin/node" "/app/server.js" ];
    WorkingDir = "/app";
  };
}
```

This approach gives you the best of both worlds: Nix's reproducibility and Docker's portability.

## 6. Getting Started with Nix

If you're interested in trying Nix:

1. **Install Nix**: Follow the [official installation guide](https://nixos.org/download.html)
2. **Learn the basics**: Start with the [Nix manual](https://nixos.org/manual/nix/stable/)
3. **Explore Nixpkgs**: Browse packages at [search.nixos.org](https://search.nixos.org/packages)

## Conclusion

Docker is excellent for containerization and has become an industry standard. However, if you need stronger guarantees about reproducibility, better multi-platform support, or more fine-grained dependency control, Nix offers compelling alternatives. Consider your specific use case and team needs when choosing between them.

