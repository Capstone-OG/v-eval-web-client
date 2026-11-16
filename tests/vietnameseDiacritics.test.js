import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanVietnameseDiacritics } from '../src/utils/vietnameseUtils.js';

test('cleanVietnameseDiacritics normalizes broken floating diacritics', () => {
  const sample = 'Nguyễn Đình Chiểu sinh ra trong một gia đình không cao sang nhưng cũng chưa đế\u00B4n nỗi phải số\u00B4ng một cuộc đời lao đao vấ\u00B4t vả nế\u00B4u không có chuyện quố\u00B4c biê\u00B4n dẫn đế\u00B4n những gia biê\u00B4n bấ\u00B4t ngờ. Thực tế\u00B4 tàn nhẫn đã khiê\u00B4n cho cuộc đời Nguyễn Đình Chiểu phải trải qua nhiê`u bước thăng trầ`m, đã phải số\u00B4ng với nhiê`u khổ đau của bản thân và của đấ\u00B4t nước. Từ thuở thơ â\u00B4u cho đế\u00B4n tuổi 11- 12, Nguyễn Đình Chiểu đã được số\u00B4ng và học tập một cách nê` nê\u00B4p bên cạnh mẹ hiê`n, người đã dày công nuôi dạy ông. Một số\u00B4 điểm có liên quan đế\u00B4n những ngày niên thiê\u00B4u của tiên sin...';

  const cleaned = cleanVietnameseDiacritics(sample);
  assert.ok(!cleaned.includes('\u00B4'));
  assert.ok(!cleaned.includes('`'));
  assert.ok(cleaned.includes('đến'));
  assert.ok(cleaned.includes('sống'));
  assert.ok(cleaned.includes('vất'));
  assert.ok(cleaned.includes('nếu'));
  assert.ok(cleaned.includes('quốc'));
  assert.ok(cleaned.includes('biến'));
  assert.ok(cleaned.includes('bất ngờ'));
  assert.ok(cleaned.includes('Thực tế'));
  assert.ok(cleaned.includes('khiến'));
  assert.ok(cleaned.includes('nhiều'));
  assert.ok(cleaned.includes('thăng trầm'));
  assert.ok(cleaned.includes('đất nước'));
  assert.ok(cleaned.includes('thơ ấu'));
  assert.ok(cleaned.includes('nề nếp'));
  assert.ok(cleaned.includes('mẹ hiền'));
  assert.ok(cleaned.includes('niên thiếu'));
});

test('cleanVietnameseDiacritics preserves LaTeX formulas and KaTeX symbols', () => {
  const formula = 'Acetone [$(\\text{CH}_3)_2\\text{CO}$, $M = 58\\text{ g/mol}$, nhiệt độ sôi $56^\\circ\\text{C}$] là một chất lỏng không màu và dễ cháy';
  const cleaned = cleanVietnameseDiacritics(formula);
  assert.equal(cleaned, formula);
});
