import * as core from '@actions/core'

async function run(): Promise<void> {
  try {
    const version: string = core.getInput('version')
    core.info(`Got version: ${version}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
