import * as core from '@actions/core';
import * as github from '@actions/github';

interface Input {
  token: string;
  org: string;
}

export function getInputs(): Input {
  const result = {} as Input;
  result.token = core.getInput('github-token');
  result.org = core.getInput('org');
  return result;
}

const run = async (): Promise<void> => {
  try {
    const input = getInputs();
    const octokit: ReturnType<typeof github.getOctokit> = github.getOctokit(input.token);

    const response = await octokit.request(`GET /orgs/${input.org}`)

    core.info(JSON.stringify(response));
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : JSON.stringify(error))
  }
};

export default run;
