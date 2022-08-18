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
  const input = getInputs();
  const octokit: ReturnType<typeof github.getOctokit> = github.getOctokit(input.token);

  let plan;
  if (github.context.serverUrl.includes('://github.com')) {
    const orgResponse = await octokit.request(`GET /orgs/${input.org}`);
    plan = orgResponse.data.plan;
  } else {
    const entResponse = await octokit.request(`GET /enterprise/settings/license`);
    plan = {
      seats: entResponse.data.seats,
      filled_seats: entResponse.data.seats_used,
    }
  }

  if (plan) {
    core.setOutput('name', plan.name);
    core.setOutput('space', plan.space);
    core.setOutput('private_repos', plan.private_repos);
    core.setOutput('filled_seats', plan.filled_seats);
    core.setOutput('seats', plan.seats);

    if (plan.filled_seats && plan.seats) {
      const percentage = Math.round(((plan.filled_seats / plan.seats) * 100));
      core.setOutput('percentage', percentage);
      const remaining = plan.seats - plan.filled_seats;
      core.setOutput('remaining', remaining);
    }
  }
};

export default run;
