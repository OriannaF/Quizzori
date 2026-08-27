const assert = require("assert");
const QuizStore = require("../js/storage.js");

global.window = { QuizStore };
require("../js/cloud.js");
const Cloud = window.Cloud;

const log = (k, v) => console.log(k.padEnd(34), v);

const originalSnap = {
  kv: {
    "quiz.progress.c3f7b2": { 0: { reps: 3, fails: 0, last: 1 } },
    "quiz.settings": { size: 20, points: 1, mode: "today" },
    "quiz.examdates.c3f7b2": { date: "2026-09-01", cats: {} }
  },
  times: {
    "quiz.progress.c3f7b2": 1000,
    "quiz.settings": 2000,
    "quiz.examdates.c3f7b2": 3000
  }
};

const doc = Cloud.docFromSnap(originalSnap, 12345);
assert.strictEqual(doc.kv["quiz__progress__c3f7b2"] !== undefined, true, "Keys must be encoded with __ for Firestore");
assert.strictEqual(doc.kv["quiz.progress.c3f7b2"], undefined, "Firestore doc cannot have dots in field names");

const restoredSnap = Cloud.snapFromDoc(doc);
assert.deepStrictEqual(restoredSnap.kv, originalSnap.kv, "Decoded snap must match original keys");
assert.deepStrictEqual(restoredSnap.times, originalSnap.times, "Decoded snap times must match");
log("cloud key encode/decode roundtrip", "OK");

const corruptedDoc = {
  kv: {
    "quiz____progress____c3f7b2": { 0: { reps: 5 } },
    "quiz__courses": []
  },
  times: {
    "quiz____progress____c3f7b2": 5000,
    "quiz__courses": 6000
  }
};
const cleanedSnap = Cloud.snapFromDoc(corruptedDoc);
assert.strictEqual(cleanedSnap.kv["quiz.progress.c3f7b2"] !== undefined, true, "Corrupted keys must be normalized");
assert.strictEqual(cleanedSnap.kv["quiz.courses"] !== undefined, true, "Courses key must be normalized");
log("corrupted key repair", "OK");

QuizStore.saveProgress("test1", { 1: { reps: 2, last: 1 } });
QuizStore.saveSettings({ size: 10, points: 2 });
const exported = QuizStore.exportData();
assert.strictEqual(exported.version, 1, "Backup version must be 1");
assert.strictEqual(typeof exported.data, "object", "Backup must have data object");
assert.strictEqual(exported.data["quiz.progress.test1"] !== undefined, true, "Backup contains saved progress");

QuizStore.clearAll();
assert.deepStrictEqual(QuizStore.loadProgress("test1"), {}, "Progress cleared");

const impRes = QuizStore.importData(exported);
assert.strictEqual(impRes.ok, true, "Import succeeded");
assert.strictEqual(impRes.count > 0, true, "Imported entries");
assert.deepStrictEqual(QuizStore.loadProgress("test1"), { 1: { reps: 2, last: 1 } }, "Progress restored from backup");
log("store export & import backup", "OK");

console.log("ALL SYNC TESTS PASSED");
