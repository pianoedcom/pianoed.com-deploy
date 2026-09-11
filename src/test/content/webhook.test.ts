import { describe, it, expect, beforeEach } from "vitest";
import { computeSignature, verifyGitHubSignature, timingSafeEqual } from "@/lib/security/webhook";
import { rateLimiters } from "@/lib/security";
import { processWebhook, classifyEvent, parsePushPayload } from "@/lib/content/webhook";
import {
  detectChangesFromCommits,
  detectChangesFromFileEntries,
} from "@/lib/content/change-detector";
import { revalidateContent, getRecordedRedirects } from "@/lib/cache/revalidate-content";
import { contentCache } from "@/lib/content/cache";
import { clearRuntimeRedirects } from "@/lib/content/redirects";
import { handleContentWebhook } from "@/app/api/webhooks/content/route";
import { postTag, POSTS_TAG, HOMEPAGE_TAG } from "@/lib/cache/tags";
const SECRET = "test-webhook-secret";
const CONTENT_PATH = "posts";
/** Build a valid GitHub push event payload as a JSON string. */
function buildPushPayload(opts: {
  commits?: Array<{
    id?: string;
    added?: string[];
    modified?: string[];
    removed?: string[];
  }>;
  ref?: string;
}): string {
  return JSON.stringify({
    ref: opts.ref ?? "refs/heads/main",
    commits: opts.commits?.map((c) => ({ id: "abc123", ...c })) ?? [],
    head_commit: { id: "abc123" },
  });
}
/** Build headers with a valid signature for the given body. */
async function signedHeaders(body: string): Promise<Record<string, string>> {
  const sig = await computeSignature(SECRET, body);
  return {
    "X-Hub-Signature-256": sig,
    "X-GitHub-Event": "push",
    "X-GitHub-Delivery": "delivery-123",
    "Content-Type": "application/json",
  };
}
// --- Signature verification tests -------------------------------------------
describe("webhook signature verification", () => {
  it("verifies a valid signature", async () => {
    const body = '{"test":true}';
    const sig = await computeSignature(SECRET, body);
    const valid = await verifyGitHubSignature(sig, SECRET, body);
    expect(valid).toBe(true);
  });
  it("rejects an invalid signature", async () => {
    const body = '{"test":true}';
    const valid = await verifyGitHubSignature("sha256=invalid", SECRET, body);
    expect(valid).toBe(false);
  });
  it("rejects a missing signature", async () => {
    const body = '{"test":true}';
    const valid = await verifyGitHubSignature(null, SECRET, body);
    expect(valid).toBe(false);
  });
  it("rejects when secret is empty", async () => {
    const body = '{"test":true}';
    const sig = await computeSignature(SECRET, body);
    const valid = await verifyGitHubSignature(sig, "", body);
    expect(valid).toBe(false);
  });
  it("rejects tampered body", async () => {
    const body = '{"test":true}';
    const sig = await computeSignature(SECRET, body);
    const valid = await verifyGitHubSignature(sig, SECRET, '{"test":false}');
    expect(valid).toBe(false);
  });
  it("timingSafeEqual handles different lengths", () => {
    expect(timingSafeEqual("abc", "abcd")).toBe(false);
    expect(timingSafeEqual("abc", "abc")).toBe(true);
    expect(timingSafeEqual("abc", "abd")).toBe(false);
  });
});
// --- Change detector tests --------------------------------------------------
describe("change detector", () => {
  it("detects created content files", () => {
    const changes = detectChangesFromCommits(
      [{ id: "c1", added: ["posts/new-article.mdx"] }],
      CONTENT_PATH,
    );
    expect(changes.created).toHaveLength(1);
    expect(changes.created[0].slug).toBe("new-article");
    expect(changes.hasContentChanges).toBe(true);
    expect(changes.affectedSlugs).toContain("new-article");
  });
  it("detects modified content files", () => {
    const changes = detectChangesFromCommits(
      [{ id: "c1", modified: ["posts/hello-world.mdx"] }],
      CONTENT_PATH,
    );
    expect(changes.modified).toHaveLength(1);
    expect(changes.modified[0].slug).toBe("hello-world");
    expect(changes.hasContentChanges).toBe(true);
  });
  it("detects deleted content files", () => {
    const changes = detectChangesFromCommits(
      [{ id: "c1", removed: ["posts/old-article.mdx"] }],
      CONTENT_PATH,
    );
    expect(changes.deleted).toHaveLength(1);
    expect(changes.deleted[0].slug).toBe("old-article");
    expect(changes.affectedSlugs).toContain("old-article");
  });
  it("detects renamed content files (heuristic: remove + add same slug)", () => {
    const changes = detectChangesFromCommits(
      [
        {
          id: "c1",
          added: ["posts/new-name.mdx"],
          removed: ["posts/old-name.mdx"],
        },
      ],
      CONTENT_PATH,
    );
    // The heuristic matches by slug, but these have different slugs, so
    // they stay as separate created + deleted. Test rename via file entries.
    expect(changes.created).toHaveLength(1);
    expect(changes.deleted).toHaveLength(1);
  });
  it("detects renames via file entries API", () => {
    const changes = detectChangesFromFileEntries(
      [
        {
          filename: "posts/new-name.mdx",
          status: "renamed",
          previous_filename: "posts/old-name.mdx",
        },
      ],
      CONTENT_PATH,
    );
    expect(changes.renamed).toHaveLength(1);
    expect(changes.renamed[0].slug).toBe("new-name");
    expect(changes.renamed[0].previousSlug).toBe("old-name");
    expect(changes.affectedSlugs).toContain("new-name");
    expect(changes.affectedSlugs).toContain("old-name");
  });
  it("ignores non-content files (code-only commit)", () => {
    const changes = detectChangesFromCommits(
      [
        {
          id: "c1",
          added: ["src/components/Button.tsx"],
          modified: ["src/app/page.tsx"],
          removed: ["src/old-file.ts"],
        },
      ],
      CONTENT_PATH,
    );
    expect(changes.hasContentChanges).toBe(false);
    expect(changes.created).toHaveLength(0);
    expect(changes.modified).toHaveLength(0);
    expect(changes.deleted).toHaveLength(0);
  });
  it("ignores content files outside the content path", () => {
    const changes = detectChangesFromCommits(
      [{ id: "c1", added: ["other-dir/hello.mdx"] }],
      CONTENT_PATH,
    );
    expect(changes.hasContentChanges).toBe(false);
  });
  it("handles .md extension files", () => {
    const changes = detectChangesFromCommits(
      [{ id: "c1", added: ["posts/markdown-post.md"] }],
      CONTENT_PATH,
    );
    expect(changes.created).toHaveLength(1);
    expect(changes.created[0].slug).toBe("markdown-post");
  });
  it("handles multiple commits in a single push", () => {
    const changes = detectChangesFromCommits(
      [
        { id: "c1", added: ["posts/post-a.mdx"] },
        { id: "c2", modified: ["posts/post-b.mdx"], removed: ["posts/post-c.mdx"] },
      ],
      CONTENT_PATH,
    );
    expect(changes.created).toHaveLength(1);
    expect(changes.modified).toHaveLength(1);
    expect(changes.deleted).toHaveLength(1);
    expect(changes.affectedSlugs).toContain("post-a");
    expect(changes.affectedSlugs).toContain("post-b");
    expect(changes.affectedSlugs).toContain("post-c");
  });
});
// --- Revalidation dispatcher tests ------------------------------------------
describe("revalidation dispatcher", () => {
  beforeEach(() => {
    contentCache.clear();
    clearRuntimeRedirects();
  });
  it("invalidates targeted tags for a created post", () => {
    contentCache.set("post:new-article", "data", {
      profile: "default",
      tags: [postTag("new-article"), POSTS_TAG, HOMEPAGE_TAG],
    });
    contentCache.set("post:unrelated", "other", {
      profile: "default",
      tags: [postTag("unrelated"), POSTS_TAG],
    });
    const changes = detectChangesFromCommits(
      [{ id: "c1", added: ["posts/new-article.mdx"] }],
      CONTENT_PATH,
    );
    const result = revalidateContent(changes);
    expect(contentCache.get("post:new-article").hasValue).toBe(false);
    expect(contentCache.get("post:unrelated").hasValue).toBe(false); // POSTS_TAG invalidated
    expect(result.invalidatedSlugs).toContain("new-article");
    expect(result.indexRevalidated).toBe(true);
  });
  it("records redirects for renamed files", () => {
    const changes = detectChangesFromFileEntries(
      [
        {
          filename: "posts/new-name.mdx",
          status: "renamed",
          previous_filename: "posts/old-name.mdx",
        },
      ],
      CONTENT_PATH,
    );
    const result = revalidateContent(changes);
    expect(result.redirects).toHaveLength(1);
    expect(result.redirects[0].from).toBe("old-name");
    expect(result.redirects[0].to).toBe("new-name");
    const recorded = getRecordedRedirects();
    const found = recorded.find((r) => r.from === "/blog/old-name");
    expect(found).toBeDefined();
    expect(found!.to).toBe("/blog/new-name");
  });
  it("does nothing when there are no content changes", () => {
    contentCache.set("post:existing", "data", {
      profile: "default",
      tags: [postTag("existing"), POSTS_TAG],
    });
    const changes = detectChangesFromCommits(
      [{ id: "c1", added: ["src/Button.tsx"] }],
      CONTENT_PATH,
    );
    const result = revalidateContent(changes);
    expect(result.invalidatedTags).toHaveLength(0);
    expect(contentCache.get("post:existing").hasValue).toBe(true);
  });
});
// --- Webhook handler (processWebhook) tests ----------------------------------
describe("processWebhook", () => {
  beforeEach(() => {
    contentCache.clear();
    clearRuntimeRedirects();
  });
  it("processes a valid push event with content changes", async () => {
    const body = buildPushPayload({
      commits: [{ id: "c1", added: ["posts/new-article.mdx"] }],
    });
    const res = processWebhook(classifyEvent("push"), "del-1", body, CONTENT_PATH);
    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
    expect(res.changes).toBeDefined();
    expect(res.changes!.created).toHaveLength(1);
    expect(res.result).toBeDefined();
    expect(res.result!.invalidatedSlugs).toContain("new-article");
  });
  it("returns no relevant changes for code-only commits", () => {
    const body = buildPushPayload({
      commits: [{ id: "c1", modified: ["src/app/page.tsx"] }],
    });
    const res = processWebhook(classifyEvent("push"), "del-2", body, CONTENT_PATH);
    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
    expect(res.message).toContain("No relevant content changes");
  });
  it("handles ping events", () => {
    const res = processWebhook(classifyEvent("ping"), "del-3", "", CONTENT_PATH);
    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
    expect(res.message).toContain("Ping received");
  });
  it("ignores unknown event types", () => {
    const res = processWebhook(classifyEvent("unknown"), "del-4", "", CONTENT_PATH);
    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
    expect(res.message).toContain("not handled");
  });
  it("rejects malformed JSON", () => {
    const res = processWebhook(classifyEvent("push"), "del-5", "not json", CONTENT_PATH);
    expect(res.status).toBe(400);
    expect(res.ok).toBe(false);
    expect(res.message).toContain("Malformed payload");
  });
  it("rejects payload without commits", () => {
    const res = processWebhook(
      classifyEvent("push"),
      "del-6",
      JSON.stringify({ ref: "refs/heads/main" }),
      CONTENT_PATH,
    );
    expect(res.status).toBe(400);
    expect(res.ok).toBe(false);
  });
  it("handles push with no commits (branch deletion)", () => {
    const body = buildPushPayload({ commits: [] });
    const res = processWebhook(classifyEvent("push"), "del-7", body, CONTENT_PATH);
    expect(res.status).toBe(200);
    expect(res.message).toContain("no commits");
  });
  it("handles deleted article", () => {
    const body = buildPushPayload({
      commits: [{ id: "c1", removed: ["posts/deleted-article.mdx"] }],
    });
    const res = processWebhook(classifyEvent("push"), "del-8", body, CONTENT_PATH);
    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
    expect(res.changes!.deleted).toHaveLength(1);
    expect(res.result!.invalidatedSlugs).toContain("deleted-article");
  });
  it("handles modified article", () => {
    const body = buildPushPayload({
      commits: [{ id: "c1", modified: ["posts/updated-article.mdx"] }],
    });
    const res = processWebhook(classifyEvent("push"), "del-9", body, CONTENT_PATH);
    expect(res.status).toBe(200);
    expect(res.changes!.modified).toHaveLength(1);
    expect(res.result!.invalidatedSlugs).toContain("updated-article");
  });
  it("handles new article", () => {
    const body = buildPushPayload({
      commits: [{ id: "c1", added: ["posts/brand-new.mdx"] }],
    });
    const res = processWebhook(classifyEvent("push"), "del-10", body, CONTENT_PATH);
    expect(res.status).toBe(200);
    expect(res.changes!.created).toHaveLength(1);
    expect(res.result!.invalidatedSlugs).toContain("brand-new");
  });
});
// --- Full webhook handler (handleContentWebhook) tests ---------------------
describe("handleContentWebhook (full flow with signature)", () => {
  beforeEach(() => {
    contentCache.clear();
    rateLimiters.webhook.clear();
    clearRuntimeRedirects();
  });
  it("accepts a valid GitHub webhook with content changes", async () => {
    const body = buildPushPayload({
      commits: [{ id: "c1", added: ["posts/webhook-test.mdx"] }],
    });
    const headers = await signedHeaders(body);
    const res = await handleContentWebhook(body, headers, SECRET, CONTENT_PATH);
    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
    expect(res.event).toBe("push");
    expect(res.deliveryId).toBe("delivery-123");
    expect(res.result).toBeDefined();
    expect(res.result!.invalidatedSlugs).toContain("webhook-test");
  });
  it("rejects invalid signature with 401", async () => {
    const body = buildPushPayload({
      commits: [{ id: "c1", added: ["posts/test.mdx"] }],
    });
    const res = await handleContentWebhook(
      body,
      {
        "X-Hub-Signature-256": "sha256=invalidsignature",
        "X-GitHub-Event": "push",
        "X-GitHub-Delivery": "del-x",
        "Content-Type": "application/json",
      },
      SECRET,
      CONTENT_PATH,
    );
    expect(res.status).toBe(401);
    expect(res.ok).toBe(false);
    expect(res.message).toContain("signature");
  });
  it("rejects missing signature with 401", async () => {
    const body = buildPushPayload({
      commits: [{ id: "c1", added: ["posts/test.mdx"] }],
    });
    const res = await handleContentWebhook(
      body,
      {
        "X-GitHub-Event": "push",
        "X-GitHub-Delivery": "del-x",
        "Content-Type": "application/json",
      },
      SECRET,
      CONTENT_PATH,
    );
    expect(res.status).toBe(401);
  });
  it("rejects signature with wrong secret", async () => {
    const body = buildPushPayload({
      commits: [{ id: "c1", added: ["posts/test.mdx"] }],
    });
    const sig = await computeSignature("wrong-secret", body);
    const res = await handleContentWebhook(
      body,
      {
        "X-Hub-Signature-256": sig,
        "X-GitHub-Event": "push",
        "X-GitHub-Delivery": "del-x",
        "Content-Type": "application/json",
      },
      SECRET,
      CONTENT_PATH,
    );
    expect(res.status).toBe(401);
  });
  it("handles ping event after signature verification", async () => {
    const body = JSON.stringify({ zen: "test", hook_id: 123 });
    const headers = await signedHeaders(body);
    headers["X-GitHub-Event"] = "ping";
    const res = await handleContentWebhook(body, headers, SECRET, CONTENT_PATH);
    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
    expect(res.message).toContain("Ping received");
  });
  it("returns no relevant changes for code-only commit", async () => {
    const body = buildPushPayload({
      commits: [
        {
          id: "c1",
          added: ["src/Button.tsx"],
          modified: ["src/App.tsx"],
        },
      ],
    });
    const headers = await signedHeaders(body);
    const res = await handleContentWebhook(body, headers, SECRET, CONTENT_PATH);
    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
    expect(res.message).toContain("No relevant content changes");
    expect(res.result).toBeUndefined();
  });
  it("handles renamed article via file entries in commits", async () => {
    // Simulate a rename as remove + add with different slugs
    const body = buildPushPayload({
      commits: [
        {
          id: "c1",
          added: ["posts/new-slug.mdx"],
          removed: ["posts/old-slug.mdx"],
        },
      ],
    });
    const headers = await signedHeaders(body);
    const res = await handleContentWebhook(body, headers, SECRET, CONTENT_PATH);
    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
    expect(res.changes!.created).toHaveLength(1);
    expect(res.changes!.deleted).toHaveLength(1);
    expect(res.result!.invalidatedSlugs).toContain("new-slug");
    expect(res.result!.invalidatedSlugs).toContain("old-slug");
  });
  it("handles malformed payload after signature verification", async () => {
    const body = "not valid json";
    const headers = await signedHeaders(body);
    const res = await handleContentWebhook(body, headers, SECRET, CONTENT_PATH);
    expect(res.status).toBe(400);
    expect(res.ok).toBe(false);
    expect(res.message).toContain("Malformed");
  });
  it("is idempotent: duplicate deliveries do not cause errors", async () => {
    const body = buildPushPayload({
      commits: [{ id: "c1", added: ["posts/idempotent-test.mdx"] }],
    });
    const headers = await signedHeaders(body);
    const res1 = await handleContentWebhook(body, headers, SECRET, CONTENT_PATH);
    const res2 = await handleContentWebhook(body, headers, SECRET, CONTENT_PATH);
    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res1.ok).toBe(true);
    expect(res2.ok).toBe(true);
  });
});
// --- parsePushPayload edge cases --------------------------------------------
describe("parsePushPayload", () => {
  it("parses a valid push payload", () => {
    const body = buildPushPayload({ commits: [{ id: "c1" }] });
    const result = parsePushPayload(body);
    expect(result.ok).toBe(true);
  });
  it("rejects non-JSON", () => {
    const result = parsePushPayload("not json");
    expect(result.ok).toBe(false);
  });
  it("rejects non-object JSON", () => {
    const result = parsePushPayload('"just a string"');
    expect(result.ok).toBe(false);
  });
  it("rejects payload without commits or head_commit", () => {
    const result = parsePushPayload(JSON.stringify({ ref: "main" }));
    expect(result.ok).toBe(false);
  });
});