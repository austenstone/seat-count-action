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
    const entResponse = await octokit.request(`GET /enterprises/${input.enterprise}/consumed-licenses`);
    plan = {
      filled_seats: entResponse.data.total_seats_consumed,
      seats: entResponse.data.total_seats_purchased
    };
  } else if (isDotCom) {
    const orgResponse = await octokit.rest.orgs.get({ org: input.org });
    core.debug(JSON.stringify({ orgResponse }))
    plan = orgResponse.data.plan;
  } else {
    const entResponse = await octokit.request(`GET /enterprise/settings/license`);
    core.debug(JSON.stringify({ entResponse }))
    plan = {
      seats: entResponse.data.seats,
      filled_seats: entResponse.data.seats_used,
    }
  }

  core.debug(JSON.stringify({ plan }))
  if (plan) {
    Object.keys(plan).forEach(key => core.setOutput(key, plan[key]));
    if (plan.filled_seats && plan.seats) {
      let percentage = 0, remaining = 0;
      if (plan.seats === 'unlimited') {
        remaining = 99999999999999;
        percentage = 0;
      } else {
        percentage = Math.round(((plan.filled_seats / plan.seats) * 100));
        core.info(`${percentage}% of seats used`)
        remaining = plan.seats - plan.filled_seats;
        core.info(`${remaining} seats remaining`)
      }
      core.info(`${remaining} seats remaining`);
      core.info(`${percentage}% of seats used`);
      core.setOutput('percentage', percentage);
      core.setOutput('remaining', remaining);
    }
  }
};

export default run;
