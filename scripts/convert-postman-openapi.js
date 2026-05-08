'use strict';

/**
 * Converts Postman Collection v2.x → OpenAPI 3.0 YAML using postman-to-openapi.
 *
 * Usage:
 *   node scripts/convert-postman-openapi.js
 *   node scripts/convert-postman-openapi.js --stdout   # print YAML, do not write file
 *
 * Customize paths below or set env:
 *   POSTMAN_COLLECTION, OPENAPI_OUTPUT
 */

const path = require('path');
const postmanToOpenApi = require('postman-to-openapi');

const ROOT = path.join(__dirname, '..');
const postmanCollection =
  process.env.POSTMAN_COLLECTION ||
  path.join(ROOT, 'postman', 'Diplomayn-API.postman_collection.json');
const outputFile =
  process.env.OPENAPI_OUTPUT || path.join(ROOT, 'postman', 'openapi.yaml');

const OPTIONS = {
  defaultTag: 'General',
  /** Override Postman `{{baseUrl}}` host so OpenAPI `servers` is valid (avoids `undefined://`). */
  servers: [{ url: 'http://localhost:5050', description: 'Local (use collection baseUrl)' }],
};

async function main() {
  const toStdout = process.argv.includes('--stdout');

  try {
    if (toStdout) {
      const yaml = await postmanToOpenApi(postmanCollection, null, OPTIONS);
      process.stdout.write(typeof yaml === 'string' ? yaml : String(yaml));
      return;
    }

    const result = await postmanToOpenApi(postmanCollection, outputFile, OPTIONS);
    console.log(`Written: ${outputFile}`);
    console.log(`OpenAPI length (chars): ${String(result).length}`);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
}

main();
