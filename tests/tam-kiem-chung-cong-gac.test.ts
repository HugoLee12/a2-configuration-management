// File tạm, chỉ tồn tại vài phút để chứng minh cổng gác của #11 chặn thật.
// Nó cố ý đỏ. Commit ngay sau đó xoá nó đi.
import assert from "node:assert/strict";
import { it } from "node:test";

it("cố ý trượt để xem pull request có bị chặn merge không", () => {
  assert.equal(1, 2);
});
