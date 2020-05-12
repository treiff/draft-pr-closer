import * as core from '@actions/core';
import * as github from '@actions/github';
import * as Webhooks from '@octokit/webhooks';

async function run(): Promise<void> {
  try {
    const token = core.getInput('repo-token', { required: true });
    const client = new github.GitHub(token);

    const draftPrs = await getDraftPrs(client);

    if (draftPrs.length) {
      for (let pr of draftPrs) {
        if (shouldClose(pr)) {
          closePr(pr, client);
        }
      }
    }
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

function shouldClose(pr: Webhooks.WebhookPayloadPullRequestPullRequest): boolean {
  const daysUntilExpiration = <number>(<unknown>core.getInput('days-before-close', { required: true }));
  const daysInMillis = 1000 * 60 * 60 * 24 * daysUntilExpiration;
  const millisSinceLastUpdated = new Date().getTime() - new Date(pr.updated_at).getTime();

  return millisSinceLastUpdated < daysInMillis;
}

async function closePr(
  pr: Webhooks.WebhookPayloadPullRequestPullRequest,
  client: github.GitHub
): Promise<void> {
  core.debug(`Closing PR #${pr.number} - ${pr.title} for being stale`);

  await client.pulls.update({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: pr.number,
    state: 'closed',
  });
}

async function getDraftPrs(client: github.GitHub): Promise<any> {
  const prResponse = await client.pulls.list({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  });

  const drafts = prResponse.data.filter((pr) => pr.draft === true);

  return drafts;
}

run();
