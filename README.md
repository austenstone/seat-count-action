# Seat Count Action

A simple [Action](https://docs.github.com/en/actions) to count the remaining seats in an organization. It is intended to be used in conjunction with other actions to do something like notify the user when there are less than 10 seats remaining.

## Usage
Create a workflow (eg: `.github/workflows/on-issue-pr-open.yml`). See [Creating a Workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

You will need to [create a PAT(Personal Access Token)](https://github.com/settings/tokens/new?scopes=admin:org) that has `admin:org` access.

Add this PAT as a secret so we can use it as input `github-token`, see [Creating encrypted secrets for a repository](https://docs.github.com/en/enterprise-cloud@latest/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository).

### Organizations

If your organization has SAML enabled you must authorize the PAT, see [Authorizing a personal access token for use with SAML single sign-on](https://docs.github.com/en/enterprise-cloud@latest/authentication/authenticating-with-saml-single-sign-on/authorizing-a-personal-access-token-for-use-with-saml-single-sign-on).

#### Example: Check seat count every day at 12:00 AM
```yml
name: Check Seat Count
on:
  schedule:
    - cron: 0 0 * * *

jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: austenstone/seat-count-action@main
        id: seats
        with:
          github-token: ${{secrets.TOKEN}}
    outputs:
      percentage: ${{steps.seats.outputs.percentage}}
      remaining: ${{steps.seats.outputs.remaining}}
  more-than-90-percent:
    needs: [seats]
    if: needs.seats.outputs.percentage > 90
    runs-on: ubuntu-latest
    steps:
      - run: echo More than 90% of seats used!
```

## ➡️ Inputs
Various inputs are defined in [`action.yml`](action.yml):

| Name | Description | Default |
| --- | - | - |
| github&#x2011;token | Token to use to authorize. | ${{&nbsp;github.token&nbsp;}} |
| org | The org to use for the action. | ${{&nbsp;github.event.organization.login&nbsp;}} |

## ⬅️ Outputs
| Name | Description |
| --- | - |
| filled_seats | The number of filled seats. |
| seats | The total number of seats. |
| percentage | Threshold percentage of seats. |
| remaining | Threshold remaining seats. |
| name | The name of the plan. |
| space | The package space remaining. |
| private_repos | The number of private repos. |

## Further help
To get more help on the Actions see [documentation](https://docs.github.com/en/actions).
