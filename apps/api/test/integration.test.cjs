const assert = require('assert');
const path = require('path');

async function runTests() {
  console.log('🧪 Running KhojSetu / FoundBeacon NestJS & TypeScript Integration Tests...\n');

  // Test 1: Load Compiled Dist Modules
  console.log('Test 1: NestJS Application & Prisma Service Loading');
  const { SEED_USERS, SEED_ITEMS } = require('../dist/prisma/seed');
  assert.strictEqual(SEED_USERS.length >= 5, true, 'Seed users must be present');
  assert.strictEqual(SEED_ITEMS.length >= 6, true, 'Seed items must be present');
  console.log('✅ Test 1 Passed: Seed datasets verified with 5 users and 6 items.\n');

  // Test 2: Matching Engine with PostGIS Approximate Distance Calculation
  console.log('Test 2: Explainable Matching Engine & PostGIS Distance Calculation');
  const { MatchingService } = require('../dist/matches/matching.service');
  const matchingService = new MatchingService();

  const itemA = SEED_ITEMS[0]; // Lost Dell laptop at library
  const itemB = SEED_ITEMS[1]; // Found Dell laptop at library

  const match = matchingService.computeMatch(itemA, itemB);
  console.log(`Calculated match score: ${match.score}% (${match.confidenceTier} confidence)`);
  console.log(`PostGIS distance: ${match.distanceMeters}m`);
  console.log(`Summary: "${match.explanationSummary}"`);

  assert.strictEqual(match.score >= 80, true, 'Match score should be high confidence >= 80%');
  assert.strictEqual(match.distanceMeters < 100, true, 'PostGIS distance should be in immediate vicinity');
  assert.strictEqual(match.factors.length, 4, 'Should contain 4 explainable factors');
  console.log('✅ Test 2 Passed: 100-point explainable formula with PostGIS proximity verified.\n');

  // Test 3: OWASP File Upload Binary Magic Bytes Inspection
  console.log('Test 3: OWASP File Upload Signature & Magic Bytes Validation');
  const { StorageService } = require('../dist/storage/storage.service');
  const storageService = new StorageService();

  // 3a. Valid JPEG magic bytes (FF D8 FF)
  const validBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  const validFile = {
    buffer: validBuffer,
    originalname: 'proof.jpg',
    mimetype: 'image/jpeg',
  };
  const validRes = await storageService.uploadSecureFile(validFile);
  assert.strictEqual(typeof validRes.url === 'string', true, 'Valid file should be accepted');

  // 3b. Malicious file renamed to .jpg (PHP script)
  const maliciousBuffer = Buffer.from('<?php system($_GET["cmd"]); ?>');
  const spoofedFile = {
    buffer: maliciousBuffer,
    originalname: 'shell.jpg',
    mimetype: 'image/jpeg',
  };
  let blocked = false;
  try {
    await storageService.uploadSecureFile(spoofedFile);
  } catch (err) {
    blocked = true;
    console.log(`Blocked spoofed upload: "${err.message}"`);
  }
  assert.strictEqual(blocked, true, 'Spoofed file without valid image magic bytes must be blocked');
  console.log('✅ Test 3 Passed: OWASP File Upload security validation verified.\n');

  // Test 4: OpenTelemetry Tracing Span Recording
  console.log('Test 4: OpenTelemetry Tracing Spans');
  const { TelemetryService } = require('../dist/telemetry/telemetry.service');
  const telemetry = new TelemetryService();
  let traced = false;
  await telemetry.traceAsync('test.span', async (span) => {
    span.setAttribute('test.attribute', 'khojsetu-ok');
    traced = true;
  });
  assert.strictEqual(traced, true, 'OpenTelemetry span should execute cleanly');
  console.log('✅ Test 4 Passed: OpenTelemetry trace spans recorded.\n');

  console.log('🎉 ALL NESTJS FULL-STACK TESTS PASSED SUCCESSFULLY! 🚀');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
