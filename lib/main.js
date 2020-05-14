"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = core.getInput('repo-token', { required: true });
            const closingComment = core.getInput('closing-comment');
            const client = new github.GitHub(token);
            const draftPrs = yield getDraftPrs(client);
            if (draftPrs.length) {
                for (let pr of draftPrs) {
                    if (shouldClose(pr)) {
                        closePr(pr, client, closingComment);
                    }
                }
            }
        }
        catch (error) {
            core.error(error);
            core.setFailed(error.message);
        }
    });
}
function shouldClose(pr) {
    const daysUntilExpiration = core.getInput('days-before-close', { required: true });
    const daysInMillis = 1000 * 60 * 60 * 24 * daysUntilExpiration;
    const millisSinceLastUpdated = new Date().getTime() - new Date(pr.updated_at).getTime();
    return millisSinceLastUpdated > daysInMillis;
}
function closePr(pr, client, closingComment) {
    return __awaiter(this, void 0, void 0, function* () {
        if (closingComment) {
            const response = yield client.issues.createComment({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                issue_number: pr.number,
                body: closingComment,
            });
            core.debug(`created comment URL: ${response.data.html_url}`);
        }
        core.debug(`Closing PR #${pr.number} - ${pr.title} for being stale`);
        yield client.pulls.update({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number: pr.number,
            state: 'closed',
        });
    });
}
function getDraftPrs(client) {
    return __awaiter(this, void 0, void 0, function* () {
        const prResponse = yield client.pulls.list({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
        });
        const drafts = prResponse.data.filter((pr) => pr.draft === true);
        return drafts;
    });
}
run();
