import * as core from '@actions/core';
import * as github from '@actions/github';

interface Input {
  token: string;
  org: string;
  enterprise: string;
}

export function getInputs(): Input {
  const result = {} as Input;
  result.token = core.getInput('github-token');
  result.org = core.getInput('org');
  result.enterprise = core.getInput('enterprise');
  return result;
}

const run = async (): Promise<void> => {
  try {
    const input = getInputs();
    const octokit: ReturnType<typeof github.getOctokit> = github.getOctokit(input.token);

    let plan;
    if (input.enterprise) {
      const entResponse = await octokit.request(`GET /enterprises/${input.enterprise}/consumed-licenses`);
      plan = {
        filled_seats: entResponse.data.total_seats_consumed,
        seats: entResponse.data.total_seats_purchased
      };
    } else if (input.org) {
      const orgResponse = await octokit.request(`GET /orgs/${input.org}`);
      plan = orgResponse.data.plan;
      if (plan) {
        core.setOutput('name', plan.name);
        core.setOutput('space', plan.space);
        core.setOutput('private_repos', plan.private_repos);
      }
    } else {
      throw new Error('No org or enterprise specified');
    }

    if (plan) {
      core.setOutput('filled_seats', plan.filled_seats);
      core.setOutput('seats', plan.seats);
      if (plan.filled_seats && plan.seats) {
        const percentage = Math.round(((plan.filled_seats / plan.seats) * 100));
        core.setOutput('percentage', percentage);
        const remaining = plan.seats - plan.filled_seats;
        core.setOutput('remaining', remaining);
      }
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : JSON.stringify(error))
  }
};

export default run;
