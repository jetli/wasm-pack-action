<p align="center">
  <a href="https://github.com/jetli/wasm-pack-action/actions"><img alt="wasm-pack-action status" src="https://github.com/jetli/wasm-pack-action/workflows/build-test/badge.svg"></a>
</p>

# `wasm-pack-action`

Install `wasm-pack` by downloading the executable (faster than `cargo install wasm-pack`, seconds vs minutes).

## Usage

```yaml
- uses: jetli/wasm-pack-action@v0.1.0
  with:
    # Optional version of wasm-pack to install(eg. '0.9.1', 'latest')
    version: 'latest'
```

## Resources
- https://github.com/rustwasm/wasm-pack
