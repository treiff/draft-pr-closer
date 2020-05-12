import * as core from '@actions/core';
import * as github from '@actions/github';

async function run(): Promise<void> {
  try {
    const token = core.getInput('repo-token', { required: true });
    const client = new github.GitHub(token);

    const draftPrNumbers = await getDraftPrs(client);
    console.log(draftPrNumbers);
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

async function getDraftPrs(client: github.GitHub): Promise<any> {
  const prResponse = await client.pulls.list({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  });

  return prResponse.data;
}

run();
