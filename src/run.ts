import * as core from '@actions/core';
import * as github from '@actions/github';

interface Input {
  token: string;
  org: string;
  enterprise: string;
}

export function getInputs(): Input {
  return {
    token: core.getInput('github-token'),
    org: core.getInput('org'),
    enterprise: core.getInput('enterprise'),
  };
}

const run = async (): Promise<void> => {
  const input = getInputs();
  const octokit: ReturnType<typeof github.getOctokit> = github.getOctokit(input.token);

  let plan;
  const isDotCom = github.context.serverUrl.match(/http[s]?:\/\/github.com/g);
  if (input.enterprise) {
    const response = await octokit.request(`GET /enterprises/${input.enterprise}/consumed-licenses`);
    plan = {
      filled_seats: response.data.total_seats_consumed,
      seats: response.data.total_seats_purchased
    };
  } else if (isDotCom) {
    const response = await octokit.rest.orgs.get({ org: input.org });
    core.debug(JSON.stringify({ response }))
    plan = response.data.plan;
  } else {
    const response = await octokit.request(`GET /enterprise/settings/license`);
    core.debug(JSON.stringify({ response }))
    plan = {
      filled_seats: response.data.seats_used,
      seats: response.data.seats
    }
  }

  core.debug(JSON.stringify(plan, null, 2))
  if (plan) {
    Object.keys(plan).forEach(key => core.setOutput(key, plan[key]));
    if (plan.filled_seats && plan.seats) {
      let percentage = 0, remaining = 0;
      if (plan.seats === 'unlimited') {
        core.setOutput('remaining', 'unlimited');
        percentage = 0;
      } else {
        const percentage = Math.round(((plan.filled_seats / plan.seats) * 100));
        core.info(`${percentage}% of seats used`)
        const remaining = plan.seats - plan.filled_seats;
        core.info(`${remaining} seats remaining`)
      }
      core.setOutput('percentage', percentage);
      core.setOutput('remaining', remaining);
    }
  }
};

export default run;
