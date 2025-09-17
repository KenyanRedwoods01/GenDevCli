import { createFile, createFolder } from "../fileManager.js";
import path from "path";

export const templates = {
  component: {
    react: (name) => `import React from 'react';

const ${name} = () => {
  return (
    <div>
      <h1>${name} Component</h1>
    </div>
  );
};

export default ${name};`,
    
    vue: (name) => `<template>
  <div>
    <h1>${name} Component</h1>
  </div>
</template>

<script>
export default {
  name: '${name}'
}
</script>

<style scoped>
</style>`
  },
  
  api: {
    express: (name) => `const express = require('express');
const router = express.Router();

// GET /api/${name.toLowerCase()}
router.get('/', (req, res) => {
  res.json({ message: '${name} API endpoint' });
});

// POST /api/${name.toLowerCase()}
router.post('/', (req, res) => {
  res.json({ message: '${name} created' });
});

module.exports = router;`,
    
    fastapi: (name) => `from fastapi import APIRouter

router = APIRouter(prefix="/${name.toLowerCase()}", tags=["${name}"])

@router.get("/")
async def get_${name.toLowerCase()}():
    return {"message": "${name} API endpoint"}

@router.post("/")
async def create_${name.toLowerCase()}():
    return {"message": "${name} created"}`
  },
  
  test: {
    jest: (name) => `const ${name} = require('./${name}');

describe('${name}', () => {
  test('should work correctly', () => {
    expect(${name}()).toBe(true);
  });
});`,
    
    mocha: (name) => `const assert = require('assert');
const ${name} = require('./${name}');

describe('${name}', function() {
  it('should work correctly', function() {
    assert.equal(${name}(), true);
  });
});`
  }
};

export function generateFromTemplate(templateType, options) {
  const { name, framework, outputPath } = options;
  
  if (!templates[templateType] || !templates[templateType][framework]) {
    return { status: "error", message: `Template not found: ${templateType}/${framework}` };
  }
  
  try {
    const content = templates[templateType][framework](name);
    const fullPath = path.join(outputPath || ".", `${name}.${getExtension(templateType, framework)}`);
    createFile(fullPath, content);
    
    return { status: "ok", path: fullPath, content };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

function getExtension(templateType, framework) {
  const extensions = {
    component: {
      react: "jsx",
      vue: "vue"
    },
    api: {
      express: "js",
      fastapi: "py"
    },
    test: {
      jest: "test.js",
      mocha: "spec.js"
    }
  };
  
  return extensions[templateType]?.[framework] || "js";
    }
