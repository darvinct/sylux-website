import assert from "node:assert/strict";
import { inviteCode, filterMembers, webhookPayload } from "../src/lib/utils.ts";

assert.equal(inviteCode("https://discord.gg/my-community"), "my-community");
assert.equal(
  inviteCode("https://discord.com/invite/nocturne?source=site"),
  "nocturne",
);
for (const invalid of [
  "javascript:alert(1)",
  "https://discord.gg.attacker.com/test",
  "https://example.com/invite/test",
  "http://discord.gg/test",
  "https://discord.gg/",
  "https://discord.gg/a/b",
])
  assert.equal(inviteCode(invalid), null);
const members = [
  { name: "Zara", handle: "@z", role: "Host" },
  { name: "Ara", handle: "@a", role: "Moderator" },
];
assert.deepEqual(filterMembers(members, "   @A ", "", false), [members[1]]);
assert.deepEqual(filterMembers(members, "", "Host", true), [members[0]]);
assert.deepEqual(filterMembers(members, "nobody", "", false), []);
assert.deepEqual(filterMembers([{ ...members[0], division: "Creative" }], "creative", "", false).map((member) => member.name), ["Zara"]);
assert.equal(filterMembers(members, "", "", true)[0].name, "Ara");
assert.equal(
  members[0].name,
  "Zara",
  "Sorting must not mutate original members",
);
const message = webhookPayload(
  "x".repeat(300),
  "@everyone <script>alert(1)</script>",
  "#ffffff",
);
assert.equal(message.embeds[0].title.length, 256);
assert.equal(message.embeds[0].color, 16777215);
assert.deepEqual(
  message.allowed_mentions.parse,
  [],
  "Exported payload must disable mentions",
);
assert.equal(
  webhookPayload("", "a".repeat(4200), "#000000").embeds[0].description.length,
  4096,
);
console.log(
  "Passed: invite validation, member filters, export limits, and mention safety.",
);
