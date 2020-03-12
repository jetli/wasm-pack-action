import * as core from '@actions/core'
import * as io from '@actions/io'
import * as tc from '@actions/tool-cache'
import * as os from 'os'
import * as path from 'path'
import * as client from 'typed-rest-client/HttpClient'

const c: client.HttpClient = new client.HttpClient('vsts-node-api')

async function findVersionLatest(): Promise<string> {
  core.info('Searching the latest version of wasm-pack ...')
  const response = await c.get(
    'https://api.github.com/repos/rustwasm/wasm-pack/releases/latest'
  )
  const body = await response.readBody()
  return Promise.resolve(JSON.parse(body).tag_name || '0.9.1')
}

async function findVersion(): Promise<string> {
  const version: string = core.getInput('version')
  if (version === 'latest' || version === null || version === undefined) {
    return await findVersionLatest()
  }
  return Promise.resolve(version)
}

async function run(): Promise<void> {
  const tempFolder = path.join(os.tmpdir(), 'setup-wasm-pack')
  await io.mkdirP(tempFolder)

  try {
    const version = await findVersion()
    core.info(`Installing wasm-pack ${version} ...`)
    const platform = process.env['PLATFORM'] || process.platform
    core.debug(platform)

    let ext = ''
    let arch = ''
    let archTopFolder = ''
    switch (platform) {
      case 'win32':
        ext = '.exe'
        arch = 'x86_64-pc-windows-msvc'
        break
      case 'darwin':
        arch = 'x86_64-apple-darwin'
        archTopFolder = `wasm-pack-v${version}-${arch}`
        break
      case 'linux':
        arch = 'x86_64-unknown-linux-musl'
        archTopFolder = `wasm-pack-v${version}-${arch}`
        break
      default:
        core.setFailed(`Unsupported platform: ${platform}`)
        return
    }
    const archive = `wasm-pack-v${version}-${arch}`
    const url = `https://github.com/rustwasm/wasm-pack/releases/download/v${version}/${archive}.tar.gz`
    core.info(`Downloading wasm-pack from ${url} ...`)
    const downloadArchive = await tc.downloadTool(url)
    core.info(`Extracting wasm-pack to ${tempFolder} ...`)
    const extractedFolder = await tc.extractTar(downloadArchive, tempFolder)
    const execFolder = path.join(os.homedir(), '.cargo', 'bin')
    await io.mkdirP(execFolder)
    const exec = `wasm-pack${ext}`
    const execPath = path.join(execFolder, exec)
    await io.mv(path.join(extractedFolder, archTopFolder, exec), execPath)
    await io.rmRF(path.join(extractedFolder, archive))
    core.info(`Installed wasm-pack to ${execPath} 🎉`)
  } catch (error) {
    core.setFailed(error.message)
  } finally {
    io.rmRF(tempFolder)
  }
}

run().then(
  () => core.info('Done'),
  err => core.error(err)
)
