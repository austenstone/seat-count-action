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

    let plan;
    if (github.context.serverUrl.match(/http[s]?:\/\/github.com/g)) {
      const orgResponse = await octokit.request(`GET /orgs/${input.org}`);
      core.debug(JSON.stringify({orgResponse}))
      plan = orgResponse.data.plan;
    } else {
      const entResponse = await octokit.request(`GET /enterprise/settings/license`);
      core.debug(JSON.stringify({entResponse}))
      plan = {
        seats: entResponse.data.seats,
        filled_seats: entResponse.data.seats_used,
      }
    }

    core.debug(JSON.stringify({plan}))
    if (plan) {
      core.setOutput('name', plan.name);
      core.setOutput('space', plan.space);
      core.setOutput('private_repos', plan.private_repos);
      core.setOutput('filled_seats', plan.filled_seats);
      core.setOutput('seats', plan.seats);

      if (plan.filled_seats && plan.seats) {
        if (plan.seats === 'unlimited') {
          core.setOutput('percentage', 0);
          core.setOutput('remaining', 'unlimited');
        } else {
          const percentage = Math.round(((plan.filled_seats / plan.seats) * 100));
          core.setOutput('percentage', percentage);
          const remaining = plan.seats - plan.filled_seats;
          core.setOutput('remaining', remaining);
        }
      }
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : JSON.stringify(error));
    core.startGroup('Error');
    core.error(JSON.stringify(error, null, 2));
    core.endGroup();
  }
};

export default run;
