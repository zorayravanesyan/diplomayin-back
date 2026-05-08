'use strict';

/**
 * Converts Postman Collection v2.x → OpenAPI 3.0 YAML using postman-to-openapi,
 * then sanitizes for Redocly / strict validators (non-empty JSON schemas, no duplicate Content-Type params).
 *
 * Usage:
 *   node scripts/convert-postman-openapi.js
 *   node scripts/convert-postman-openapi.js --stdout   # print YAML, do not write file
 *
 * Customize paths below or set env:
 *   POSTMAN_COLLECTION, OPENAPI_OUTPUT
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
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

const EMPTY_JSON_SCHEMA = { schema: { type: 'object' } };

/**
 * @param {Record<string, unknown>} doc
 */
function sanitizeOpenApi(doc) {
  if (typeof doc.openapi === 'string') {
    doc.openapi = '3.0.3';
  }

  if (Array.isArray(doc.tags)) {
    for (const t of doc.tags) {
      if (t && t.name === 'Chat' && typeof t.description === 'string') {
        t.description =
          'OpenAI-backed fitness assistant.\nRequires valid OpenAI config on server.';
      }
    }
  }

  function fixContentObject(content) {
    if (!content || typeof content !== 'object') return;
    const json = content['application/json'];
    if (json && typeof json === 'object' && Object.keys(json).length === 0) {
      content['application/json'] = { ...EMPTY_JSON_SCHEMA };
    }
  }

  function walk(node) {
    if (node == null || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }

    if (Array.isArray(node.parameters)) {
      node.parameters = node.parameters.filter(
        (p) => !(p && p.name === 'Content-Type' && p.in === 'header')
      );
    }

    if (node.content && typeof node.content === 'object') {
      fixContentObject(node.content);
    }

    for (const v of Object.values(node)) walk(v);
  }

  walk(doc);
}

async function main() {
  const toStdout = process.argv.includes('--stdout');

  try {
    const raw = await postmanToOpenApi(postmanCollection, null, OPTIONS);
    const doc = yaml.load(raw);
    if (!doc || typeof doc !== 'object') {
      throw new Error('postman-to-openapi did not return a YAML object');
    }
    sanitizeOpenApi(doc);
    const out = yaml.dump(doc, {
      lineWidth: 120,
      noRefs: true,
      quotingType: '"',
    });

    if (toStdout) {
      process.stdout.write(out);
      return;
    }

    await fs.writeFile(outputFile, out, 'utf8');
    console.log(`Written: ${outputFile}`);
    console.log(`OpenAPI length (chars): ${out.length}`);
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
}

main();
