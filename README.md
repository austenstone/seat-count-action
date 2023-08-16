# Seat Count Action

A simple [Action](https://docs.github.com/en/actions) to count the remaining seats in an GitHub plan. It is intended to be used in conjunction with other actions to do something like notify the user when there are less than 10 seats remaining.

The values output from this action could be from the organization or the enterprise depending on the [GitHub plan](https://github.com/pricing).

## Usage
Create a workflow (eg: `.github/workflows/seat-count.yml`). See [Creating a Workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

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
  seats:
    runs-on: ubuntu-latest
    steps:
      - uses: austenstone/seat-count-action@main
        id: seats
        with:
          github-token: ${{secrets.TOKEN}}
    outputs:
      percentage: ${{steps.seats.outputs.percentage}}
      remaining: ${{steps.seats.outputs.remaining}}
  less-than-10-percent:
    needs: [seats]
    if: needs.seats.outputs.remaining < 10
    runs-on: ubuntu-latest
    steps:
      - run: echo "Only ${{needs.seats.outputs.remaining}} GitHub seats remaining!"
```
## Example Notification Actions
You can send a notifcation using any medium.

### [slack-send](https://github.com/marketplace/actions/slack-send)

[example](./.github/workflow-templates/slack.yml)

![image](https://user-images.githubusercontent.com/22425467/187817355-b4da99fd-3759-49f4-a9fd-42575b7c47a8.png)

### [send-email](https://github.com/marketplace/actions/send-email)

[example](./.github/workflow-templates/email.yml)

![image](https://user-images.githubusercontent.com/22425467/187832679-315b53c7-3903-4103-9e85-509e2ae02b18.png)

### [jira-create-issue](https://github.com/marketplace/actions/jira-create-issue)

[example](./.github/workflow-templates/jira.yml)

![image](https://user-images.githubusercontent.com/22425467/187834167-3b6879d9-788e-4e76-b8e2-9710b2600b81.png)

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
